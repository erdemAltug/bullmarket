import 'server-only';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/** Free-tier chat default (Llama 3.3 retired on Groq free, Aug 2026). */
const DEFAULT_MODEL = 'openai/gpt-oss-20b';
const FALLBACK_MODELS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b',
] as const;

const RETIRED: Record<string, string> = {
  'llama-3.3-70b-versatile': DEFAULT_MODEL,
  'llama 3.3-70b-versatile': DEFAULT_MODEL,
  'llama-3.1-8b-instant': DEFAULT_MODEL,
  'llama-3.1-70b-versatile': DEFAULT_MODEL,
  'mixtral-8x7b-32768': DEFAULT_MODEL,
};

const SYSTEM_BASE = `Sen Bullsye Portföy Asistanısın. Türkçe, net ve biraz derin konuş (ama laf kalabalığı yok).

Kurallar:
- Yatırım tavsiyesi VERME. Al / sat / tut / "almalısın" deme. "garanti" kullanma.
- Canlı veri yalnızca CONTEXT'ten gelir. Sembol sorulunca önce piyasa=, fiyat=, gün %, şirket adı.
- CONTEXT'te hedefOrtalama / hedefYüksek / hedefDüşük / öneriDağılımı varsa bunları yorumla (kurum konsensüsü). Prim % varsa hesapla veya CONTEXT'tekini kullan.
- Boğa / ayı senaryolarını CONTEXT rakamlarına dayandır (ör. hedef bandı, 52h yüksek/düşük, F/K). Spekülatif hikâye uydurma.
- "Boğa senaryosu" ve "ayı senaryosu" diye iki kısa paragraf yazabilirsin; emir dili kullanma.
- CONTEXT içindeki piyasa= ve sayfa= alanlarına uy (BIST → /bist/, NASDAQ → /nasdaq/).
- Envanterde yoksa bir cümlede belirt, yine de CONTEXT ile derin çerçeve ver.
- Portföy sorularında yoğunlaşma / alarm / nakit dilimine öncelik ver.
- Uzunluk: sembol sorularında genelde 6–12 cümle veya kısa maddeler.
- Sonunda tek satır: "Yatırım tavsiyesi değildir."`;

function resolveModel(): string {
  const raw = (process.env.GROQ_MODEL ?? '').trim().replace(/\s+/g, '-');
  if (!raw) return DEFAULT_MODEL;
  return RETIRED[raw] ?? RETIRED[raw.toLowerCase()] ?? raw;
}

function modelQueue(): string[] {
  const primary = resolveModel();
  const rest = FALLBACK_MODELS.filter((m) => m !== primary);
  return [primary, ...rest];
}

export async function callAsistanLlm(input: {
  contextPack: string;
  history: ChatTurn[];
  message: string;
}): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!groqKey) {
    throw new Error('LLM yapılandırılmamış');
  }

  const messages = [
    {
      role: 'system' as const,
      content: `${SYSTEM_BASE}\n\n--- CONTEXT ---\n${input.contextPack}\n--- /CONTEXT ---`,
    },
    ...input.history.slice(-6).map((t) => ({
      role: t.role,
      content: t.content.slice(0, 2000),
    })),
    { role: 'user' as const, content: input.message.slice(0, 2000) },
  ];

  const errors: string[] = [];
  for (const model of modelQueue()) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 1400,
        messages,
      }),
    });

    if (!res.ok) {
      const err = (await res.text()).slice(0, 200);
      errors.push(`${model}: ${res.status}`);
      console.error('asistan groq fail', model, err);
      if (res.status === 404 || res.status === 400) continue;
      break;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (text) return text;
    errors.push(`${model}: empty`);
  }

  console.error('asistan groq exhausted', errors.join(' | '));
  throw new Error('Asistan yanıt veremedi. Biraz sonra tekrar dene.');
}
