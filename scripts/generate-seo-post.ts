import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

type TopicPool = 'borsa' | 'teknik' | 'kripto';

interface TopicSeed {
  pool: TopicPool;
  query: string;
  tags: string[];
  category: 'BIST' | 'Teknik Analiz' | 'Kripto' | 'Temel Analiz' | 'Akademi';
  toolHref: string;
  toolLabel: string;
}

interface GeneratedPost {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  tags: string[];
  readingMinutes: number;
  faqs: { question: string; answer: string }[];
  bodyMarkdown: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

const INLINE_CTA =
  '💡 **İpucu:** Canlı skor için [fırsat masası](https://bullsye.app/firsatlar) · kurum hedefleri için [analist hedef fiyatları](https://bullsye.app/targets).';

const INTERNAL_LINKS: Record<TopicPool, string> = {
  borsa:
    '- [BİST 100 canlı tarama](https://bullsye.app/bist)\n- [Analist tavsiyeleri ve hedef fiyatları](https://bullsye.app/targets)\n- [Temettü masası](https://bullsye.app/dividends)',
  teknik:
    '- [Fırsat skoru (0–100)](https://bullsye.app/firsatlar)\n- [Sinyal radarı](https://bullsye.app/signals)\n- [Fırsat skoru nasıl okunur](https://bullsye.app/egitim/teknik-analiz/ai-firsat-skoru-nasil-okunur)',
  kripto:
    '- [Kripto tarama](https://bullsye.app/crypto)\n- [Fırsat masası](https://bullsye.app/firsatlar)\n- [Fon & ETF](https://bullsye.app/fon)',
};

const TOPIC_POOLS: TopicSeed[] = [
  // Borsa & BİST
  {
    pool: 'borsa',
    query: 'Temettü verimi en yüksek hisseler',
    tags: ['BİST', 'temettü', 'hisse', 'nakit-akisi'],
    category: 'BIST',
    toolHref: '/dividends',
    toolLabel: 'Temettü Masası',
  },
  {
    pool: 'borsa',
    query: 'F/K ve PD/DD oranı hesaplama',
    tags: ['BİST', 'değerleme', 'temel analiz', 'F/K'],
    category: 'Temel Analiz',
    toolHref: '/bist',
    toolLabel: 'BİST Screener',
  },
  {
    pool: 'borsa',
    query: 'BİST 100 hisse analiz rehberi',
    tags: ['BİST', 'XU100', 'analiz', 'screener'],
    category: 'BIST',
    toolHref: '/bist',
    toolLabel: 'BİST Canlı',
  },
  // Teknik Analiz
  {
    pool: 'teknik',
    query: 'RSI indikatörü alım satım sinyalleri',
    tags: ['RSI', 'indikatör', 'al-sat', 'risk-yonetimi'],
    category: 'Teknik Analiz',
    toolHref: '/signals',
    toolLabel: 'AI Sinyaller',
  },
  {
    pool: 'teknik',
    query: 'Golden Cross nedir?',
    tags: ['hareketli ortalama', 'trend', 'Golden Cross', 'teknik analiz'],
    category: 'Teknik Analiz',
    toolHref: '/signals',
    toolLabel: 'Sinyal Radarı',
  },
  {
    pool: 'teknik',
    query: 'Destek ve direnç seviyeleri çizimi',
    tags: ['destek', 'direnç', 'fiyat-aksiyonu', 'risk-yonetimi'],
    category: 'Teknik Analiz',
    toolHref: '/signals',
    toolLabel: 'Sinyal Radarı',
  },
  {
    pool: 'borsa',
    query: 'Hisse hedef fiyatı nasıl okunur',
    tags: ['hedef fiyat', 'analist', 'konsensüs', 'BİST'],
    category: 'Temel Analiz',
    toolHref: '/targets',
    toolLabel: 'Hedef Fiyatlar',
  },
  {
    pool: 'teknik',
    query: 'BİST alım fırsatı günlük tarama',
    tags: ['fırsat skoru', 'BİST', 'tarama', 'RSI'],
    category: 'Teknik Analiz',
    toolHref: '/firsatlar',
    toolLabel: 'Fırsat Masası',
  },
  {
    pool: 'borsa',
    query: 'Sabah borsa rutini 10 dakika',
    tags: ['rutin', 'BİST 100', 'canlı', 'alarm'],
    category: 'Akademi',
    toolHref: '/bist',
    toolLabel: 'BİST Canlı',
  },
  // Kripto & Fonlar
  {
    pool: 'kripto',
    query: 'S&P 500 ETF fonları rehberi',
    tags: ['ETF', 'S&P 500', 'fon', 'beta'],
    category: 'Temel Analiz',
    toolHref: '/fon',
    toolLabel: 'Fon & ETF',
  },
  {
    pool: 'kripto',
    query: 'Kripto parada stop-loss koyma stratejileri',
    tags: ['kripto', 'stop-loss', 'risk-yonetimi', 'pozisyon'],
    category: 'Kripto',
    toolHref: '/crypto',
    toolLabel: 'Kripto Radar',
  },
];

function slugify(input: string): string {
  return input
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function existingSlugs(): Set<string> {
  if (!fs.existsSync(BLOG_DIR)) return new Set();
  return new Set(
    fs
      .readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
        const { data } = matter(raw);
        return String(data.slug ?? path.basename(f, '.md'));
      })
  );
}

function pickTopic(used: Set<string>): TopicSeed {
  const unused = TOPIC_POOLS.filter((t) => !used.has(slugify(t.query)));
  const pool = unused.length ? unused : TOPIC_POOLS;
  // Rotate by ISO week so Tue/Fri runs diversify pools
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const week = Math.floor(
    (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const dayBias = now.getUTCDay() === 5 ? 1 : 0; // Fri vs Tue offset
  return pool[(week + dayBias) % pool.length]!;
}

function wordCount(text: string): number {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function extractJson(raw: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(raw);
  const candidate = (fenced?.[1] ?? raw).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('Model yanıtında JSON bulunamadı');
  return JSON.parse(candidate.slice(start, end + 1));
}

const MIN_WORDS = 1100;
const MAX_WORDS = 1700;

class QualityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QualityError';
  }
}

function buildPrompt(topic: TopicSeed, slug: string): string {
  return `Sen Bullsye (https://bullsye.app) Principal Financial Analyst ve Lead Quantitative Researcher'sın.
Hedef anahtar kelime: "${topic.query}"
Slug: ${slug}
Kategori: ${topic.category}

GÖREV: Kurumsal kalitede, eyleme dönük, teknik derinlikli, E-E-A-T uyumlu Türkçe eğitim makalesi.

HEDEF NİYET:
- Sıfır dolgu. Mekanik, formül, risk parametresi ve icra adımına hemen gir.
- Featured snippet: İLK ## başlığından hemen sonra 45–55 kelimelik net tanım paragrafı (tek blok).
- Kurumsal ton: nicel trader + bireysel yatırımcı; analitik, otoriter.

ZORUNLU UZUNLUK:
- bodyMarkdown 1300–1600 kelime (hedef ~1400). 1100 altı GEÇERSİZ.
- En az 8 ## bölümü. Her bölümde ≥3 paragraf (4–7 cümle) VEYA formül + icra listesi.
- En az 1 matematiksel tanım (LaTeX veya düz metin formül: RSI, F/K, stop mesafesi vb.).
- En az 1 risk parametresi tablosu veya maddeli eşik listesi (ör. RSI 30/70, stop %1.5–3 ATR).

BAŞLIK:
- title formatı: "${topic.query}: [eyleme dönük fayda / derin rehber]"
- description: 50–150 karakter, birincil kelime + niyet + kanca.

İSKELET (başlıkları konuya uyarla, sıra korunur):
1. Tanım (snippet 45–55 kelime) + mekanik
2. Formül / hesap
3. Piyasa bağlamı (BİST / NASDAQ / kripto — hangisi konuya uyuyorsa)
4. Adım adım icra (emir, lot, stop, zaman dilimi)
5. Yanlış sinyal ve tuzaklar
6. Risk ve pozisyon boyutu
7. Bullsye terminalinde doğrulama (araç içi linkler)
8. Kontrol listesi + sonuç

İÇ LİNK / DÖNÜŞÜM (bağlamsal, en az 3 ayrı markdown linki):
${INTERNAL_LINKS[topic.pool]}
Gövdenin ORTA bölümünden hemen sonra şu satırı AYNEN ekle:
${INLINE_CTA}

YASAK:
- Yatırım tavsiyesi, “kesin kazanç”, sahte fiyat/getiri.
- Vendor marka (Yahoo, TradingView, Investing).
- H1. Sadece ##.
- Genel “borsa nedir” girişleri.

faqs: tam 4 teknik soru-cevap (snippet uzunluğunda cevap).
keywords: 5–8 TR terim, birincil sorgu dahil.
readingMinutes: 8.

Yanıt SADECE JSON:
{
  "title": string,
  "description": string,
  "keywords": string[],
  "readingMinutes": number,
  "faqs": [{"question": string, "answer": string}],
  "bodyMarkdown": string
}`;
}

const GEMINI_MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro-latest',
] as const;

function geminiModelScore(model: string): number {
  const m = model.toLowerCase();
  if (/lite/.test(m)) return 6;
  if (/1\.0|gemini-pro(?!-)/.test(m) && !/1\.5|2\./.test(m)) return 5;
  if (/2\.5-pro|2\.0-pro/.test(m)) return 1;
  if (/2\.5-flash|2\.0-flash|flash-latest/.test(m)) return 0;
  if (/1\.5-pro/.test(m)) return 2;
  if (/1\.5-flash|flash/.test(m)) return 3;
  if (/pro/.test(m)) return 2;
  return 4;
}

function resolveGeminiModels(): string[] {
  // GitHub Actions sets GEMINI_MODEL="" when vars.GEMINI_MODEL is unset —
  // empty string must NOT win over the default (?? only skips null/undefined).
  const preferred = (process.env.GEMINI_MODEL ?? '').trim().replace(/^models\//, '');
  const ordered = preferred
    ? [preferred, ...GEMINI_MODEL_FALLBACKS.filter((m) => m !== preferred)]
    : [...GEMINI_MODEL_FALLBACKS];
  return [...new Set(ordered)];
}

async function listGeminiGenerateModels(apiKey: string): Promise<string[]> {
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models?pageSize=100';
  const res = await fetch(url, {
    headers: { 'x-goog-api-key': apiKey },
  });
  if (!res.ok) {
    console.warn(`ListModels ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return [];
  }
  const data = (await res.json()) as {
    models?: { name?: string; supportedGenerationMethods?: string[] }[];
  };
  return (data.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m) => (m.name ?? '').replace(/^models\//, ''))
    .filter(Boolean);
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY missing');

  const discovered = await listGeminiGenerateModels(key);
  if (discovered.length) {
    console.log(`Gemini ListModels: ${discovered.slice(0, 8).join(', ')}…`);
  } else {
    console.warn('Gemini ListModels boş/başarısız — fallback listesine düşülüyor');
  }

  const preferred = resolveGeminiModels();
  const models = [
    ...preferred.filter((m) => !discovered.length || discovered.includes(m)),
    ...discovered.filter((m) => !preferred.includes(m)),
  ];
  models.sort((a, b) => geminiModelScore(a) - geminiModelScore(b));
  const withoutLite = models.filter((m) => !/lite/i.test(m));
  const queue = (withoutLite.length ? withoutLite : models).slice(0, 6);

  if (!models.length) {
    throw new Error(
      'Gemini: generateContent destekleyen model yok (API key / Generative Language API kontrol et)'
    );
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 16384,
      responseMimeType: 'application/json',
    },
  });

  const errors: string[] = [];
  for (const model of queue) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    console.log(`Gemini try: ${model}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body,
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      errors.push(`${model} → ${res.status}: ${detail}`);
      // 404/400 = wrong model; 429/5xx = capacity — try next model, don't abort the chain
      if (
        res.status === 404 ||
        res.status === 400 ||
        res.status === 429 ||
        res.status >= 500
      ) {
        continue;
      }
      throw new Error(`Gemini ${res.status} [${model}]: ${detail}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('');
    if (!text) {
      errors.push(`${model} → boş aday`);
      continue;
    }
    console.log(`Gemini OK: ${model}`);
    return text;
  }

  throw new Error(
    `Gemini başarısız (denenen: ${models.slice(0, 6).join(', ')}):\n${errors.join('\n')}`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(msg: string): boolean {
  return /503|429|502|500|UNAVAILABLE|high demand|overloaded|capacity|rate limit/i.test(
    msg
  );
}

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY missing');
  const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
  console.log(`Groq try: ${model}`);
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 16000,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Türkçe finans SEO editörüsün. Yalnızca geçerli JSON döndür.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq boş yanıt döndü');
  console.log(`Groq OK: ${model}`);
  return text;
}

async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY missing');
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Türkçe finans SEO editörüsün. Yalnızca geçerli JSON döndür.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI boş yanıt döndü');
  return text;
}

async function generateWithLLM(
  prompt: string,
  topic: TopicSeed,
  slug: string
): Promise<GeneratedPost> {
  const providers: { name: string; fn: () => Promise<string> }[] = [];
  if (process.env.GEMINI_API_KEY?.trim()) {
    providers.push({ name: 'Gemini', fn: () => callGemini(prompt) });
  }
  if (process.env.GROQ_API_KEY?.trim()) {
    providers.push({ name: 'Groq', fn: () => callGroq(prompt) });
  }
  if (process.env.OPENAI_API_KEY?.trim()) {
    providers.push({ name: 'OpenAI', fn: () => callOpenAI(prompt) });
  }
  if (!providers.length) {
    throw new Error('GEMINI_API_KEY, GROQ_API_KEY veya OPENAI_API_KEY gerekli');
  }

  const errors: string[] = [];
  for (let i = 0; i < providers.length; i++) {
    const { name, fn } = providers[i]!;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const raw = await fn();
        const post = parseGenerated(raw, topic, slug);
        const words = wordCount(post.bodyMarkdown);
        console.log(`${name} OK · ${words} kelime`);
        return post;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${name} #${attempt}: ${msg}`);
        console.error(`${name} failed (try ${attempt}/2) → ${msg}`);
        const quality = err instanceof QualityError || /kelime sayısı/i.test(msg);
        if (quality) break;
        if (isTransientError(msg) && attempt < 2) {
          const wait = 2000 * attempt;
          console.warn(`${name} kapasite hatası, ${wait}ms sonra tekrar…`);
          await sleep(wait);
          continue;
        }
        break;
      }
    }
    if (i < providers.length - 1) {
      console.warn(`Falling back from ${name} → ${providers[i + 1]!.name}…`);
    }
  }

  throw new Error(`Tüm LLM sağlayıcıları başarısız:\n${errors.join('\n')}`);
}

function ensureInlineCta(body: string): string {
  if (body.includes('bullsye.app/terminal')) return body;
  const lines = body.split('\n');
  const h2Idx = lines
    .map((l, i) => (/^##\s+/.test(l) ? i : -1))
    .filter((i) => i >= 0);
  const insertAt =
    h2Idx.length >= 3 ? h2Idx[2]! : Math.floor(lines.length / 2);
  lines.splice(insertAt, 0, '', INLINE_CTA, '');
  return lines.join('\n');
}

function renderMarkdown(post: GeneratedPost, topic: TopicSeed): string {
  const today = new Date().toISOString().slice(0, 10);
  const doc = matter.stringify(post.bodyMarkdown.trim() + '\n', {
    title: post.title,
    slug: post.slug,
    description: post.description,
    date: today,
    category: topic.category,
    tags: post.tags,
    readTime: post.readingMinutes,
    author: 'Bullsye Research Team',
    keywords: post.keywords,
    publishedAt: today,
    updatedAt: today,
    readingMinutes: post.readingMinutes,
    toolCta: {
      href: topic.toolHref,
      label: topic.toolLabel,
      blurb:
        'Makaledeki yöntemi canlı veriyle doğrulayın — skor, seviye ve alarm aynı terminalde.',
    },
    faqs: post.faqs,
    canonical: `https://bullsye.app/blog/${post.slug}`,
    pool: topic.pool,
    seedQuery: topic.query,
  });
  return doc;
}

function parseGenerated(
  raw: string,
  topic: TopicSeed,
  slug: string
): GeneratedPost {
  const parsed = extractJson(raw) as Record<string, unknown>;
  const faqsRaw = Array.isArray(parsed.faqs) ? parsed.faqs : [];
  const faqs = faqsRaw.slice(0, 4).map((f) => {
    const o = f as Record<string, unknown>;
    return {
      question: String(o.question ?? ''),
      answer: String(o.answer ?? ''),
    };
  });
  if (faqs.length < 2) {
    throw new QualityError('En az 2 FAQ gerekli');
  }

  let body = ensureInlineCta(String(parsed.bodyMarkdown ?? ''));
  const sections = (body.match(/^##\s+/gm) ?? []).length;
  if (sections < 8) {
    throw new QualityError(`Bölüm sayısı düşük: ${sections} (min 8)`);
  }
  const linkCount = (body.match(/\]\(https:\/\/bullsye\.app\/[^)]+\)/g) ?? [])
    .length;
  if (linkCount < 3) {
    throw new QualityError(`İç link yetersiz: ${linkCount} (min 3)`);
  }
  const words = wordCount(body);
  if (words < MIN_WORDS) {
    throw new QualityError(
      `Kelime sayısı düşük: ${words} (min ${MIN_WORDS}, hedef 1300–1500)`
    );
  }
  if (words > MAX_WORDS) {
    console.warn(`Kelime sayısı yüksek: ${words} — kabul ediliyor`);
  }

  const title = String(parsed.title ?? topic.query).trim();
  const description = String(parsed.description ?? '')
    .trim()
    .slice(0, 160);
  const keywords = (
    Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [topic.query]
  ).slice(0, 8);
  const readingMinutes = Math.min(
    12,
    Math.max(
      6,
      Number(parsed.readingMinutes) || Math.round(words / 200)
    )
  );

  return {
    slug,
    title,
    description,
    keywords,
    tags: topic.tags,
    readingMinutes,
    faqs,
    bodyMarkdown: body,
  };
}

async function main() {
  console.log(
    `content:generate @ ${new Date().toISOString()} | gemini=${Boolean(process.env.GEMINI_API_KEY?.trim())} groq=${Boolean(process.env.GROQ_API_KEY?.trim())} openai=${Boolean(process.env.OPENAI_API_KEY?.trim())}`
  );
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const used = existingSlugs();
  const topic = pickTopic(used);
  let slug = slugify(topic.query);
  if (used.has(slug)) {
    slug = `${slug}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  }

  console.log(`Topic [${topic.pool}]: ${topic.query}`);
  console.log(`Slug: ${slug}`);

  const prompt = buildPrompt(topic, slug);
  let post: GeneratedPost;
  try {
    post = await generateWithLLM(prompt, topic, slug);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`content:generate skipped (providers exhausted):\n${msg}`);
    process.exit(0);
  }
  console.log(`Words: ${wordCount(post.bodyMarkdown)}`);

  const outPath = path.join(BLOG_DIR, `${slug}.md`);
  if (fs.existsSync(outPath)) {
    throw new Error(`Dosya zaten var: ${outPath}`);
  }

  fs.writeFileSync(outPath, renderMarkdown(post, topic), 'utf8');
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
