import 'server-only';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

const SYSTEM_BASE = `Sen Bullsye Portföy Asistanısın. Türkçe, kısa ve profesyonel konuş.

Kurallar:
- Yatırım tavsiyesi VERME. Al / sat / tut deme. "garanti", "kesin yükselir" kullanma.
- Sadece CONTEXT bloğundaki sayıları ve bulguları kullan. Uydurma fiyat/skor yok.
- CONTEXT'te yoksa "envanterimde bu veri yok" de; /portfolio, /bist/{sembol}, /firsatlar, /targets linklerine yönlendir.
- Cevapları 2–6 kısa paragraf veya maddelerle tut.
- Sonunda tek satır: "Yatırım tavsiyesi değildir."`;

export async function callAsistanLlm(input: {
  contextPack: string;
  history: ChatTurn[];
  message: string;
}): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!groqKey) {
    throw new Error('GROQ_API_KEY tanımlı değil');
  }

  const model = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';
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

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 900,
      messages,
    }),
  });

  if (!res.ok) {
    const err = (await res.text()).slice(0, 300);
    throw new Error(`Groq ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Boş yanıt');
  return text;
}
