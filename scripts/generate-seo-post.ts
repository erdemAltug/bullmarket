import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

type TopicPool = 'borsa' | 'teknik' | 'kripto';

interface TopicSeed {
  pool: TopicPool;
  query: string;
  tags: string[];
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
  '💡 **İpucu:** Makalede bahsettiğimiz hisse ve kripto varlıkların canlı AI Fırsat Skorlarını görmek için [Bullsye Canlı Radarı\'nı İnceleyin ↗](https://bullsye.app/terminal)';

const TOPIC_POOLS: TopicSeed[] = [
  // Borsa & BİST
  {
    pool: 'borsa',
    query: 'Temettü verimi en yüksek hisseler',
    tags: ['BİST', 'temettü', 'hisse'],
    toolHref: '/firsatlar',
    toolLabel: 'Fırsat Masası',
  },
  {
    pool: 'borsa',
    query: 'F/K ve PD/DD oranı hesaplama',
    tags: ['BİST', 'değerleme', 'temel analiz'],
    toolHref: '/bist',
    toolLabel: 'BİST Screener',
  },
  {
    pool: 'borsa',
    query: 'BİST 100 hisse analiz rehberi',
    tags: ['BİST', 'XU100', 'analiz'],
    toolHref: '/bist',
    toolLabel: 'BİST Canlı',
  },
  // Teknik Analiz
  {
    pool: 'teknik',
    query: 'RSI indikatörü alım satım sinyalleri',
    tags: ['teknik analiz', 'RSI', 'sinyal'],
    toolHref: '/signals',
    toolLabel: 'AI Sinyaller',
  },
  {
    pool: 'teknik',
    query: 'Golden Cross nedir?',
    tags: ['teknik analiz', 'hareketli ortalama', 'trend'],
    toolHref: '/signals',
    toolLabel: 'Sinyal Radarı',
  },
  {
    pool: 'teknik',
    query: 'Destek ve direnç seviyeleri çizimi',
    tags: ['teknik analiz', 'destek', 'direnç'],
    toolHref: '/terminal',
    toolLabel: 'Canlı Terminal',
  },
  // Kripto & Fonlar
  {
    pool: 'kripto',
    query: 'S&P 500 ETF fonları rehberi',
    tags: ['ETF', 'S&P 500', 'fon'],
    toolHref: '/fon',
    toolLabel: 'Fon & ETF',
  },
  {
    pool: 'kripto',
    query: 'Kripto parada stop-loss koyma stratejileri',
    tags: ['kripto', 'risk', 'stop-loss'],
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

function buildPrompt(topic: TopicSeed, slug: string): string {
  return `Sen Bullsye (https://bullsye.app) için Türkçe finans editörüsün.
Hedef arama sorgusu: "${topic.query}"
Slug: ${slug}

Kurallar:
- 1200–1500 kelime Türkçe makale yaz (yatırım tavsiyesi verme; eğitim/rehber tonu).
- Sadece ## alt başlıkları kullan (H1 yok; title frontmatter'da).
- En az 6 bölüm: giriş, kavram, adım adım uygulama, yaygın hatalar, Bullsye ile pratik, sonuç.
- Gerçekçi TR piyasa bağlamı (BİST/kripto/fon) kullan; sahte fiyat/getiri uydurma.
- Vendor marka (Yahoo, TradingView vb.) kullanıcı metninde geçmesin.
- Makale gövdesinin ORTA bölümlerinden birinin hemen ardından şu satırı AYNEN ekle (ayrı bir paragraf olarak):
${INLINE_CTA}
- FAQ: tam 4 soru-cevap, arama niyetine uygun, kısa cevaplar.
- keywords: 5–8 TR arama terimi.
- description: max 155 karakter, tıklanabilir SEO özeti.
- readingMinutes: kelime/200 yuvarlanmış (6–10 arası).

Yanıtı SADECE şu JSON şemasında ver (markdown yok):
{
  "title": string,
  "description": string,
  "keywords": string[],
  "readingMinutes": number,
  "faqs": [{"question": string, "answer": string}],
  "bodyMarkdown": string
}`;
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY missing');
  // gemini-2.0-flash retired (404). Prefer env override, else stable Flash.
  const model = (process.env.GEMINI_MODEL ?? 'gemini-2.5-flash').replace(
    /^models\//,
    ''
  );
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Gemini ${res.status} [${model}]: ${(await res.text()).slice(0, 400)}`
    );
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? '')
    .join('');
  if (!text) throw new Error('Gemini boş yanıt döndü');
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

async function generateWithLLM(prompt: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) return callGemini(prompt);
  if (process.env.OPENAI_API_KEY) return callOpenAI(prompt);
  throw new Error('GEMINI_API_KEY veya OPENAI_API_KEY gerekli');
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
    slug: post.slug,
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    publishedAt: today,
    updatedAt: today,
    readingMinutes: post.readingMinutes,
    tags: post.tags,
    toolCta: {
      href: '/terminal',
      label: "Bullsye Canlı Radarı'nı İncele",
      blurb:
        'Makalede bahsettiğimiz hisse ve kripto varlıkların canlı AI Fırsat Skorlarını terminal radarında görün.',
    },
    faqs: post.faqs,
    // Dynamic metadata hints consumed by blog [slug] generateMetadata
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
    throw new Error('En az 2 FAQ gerekli');
  }

  let body = ensureInlineCta(String(parsed.bodyMarkdown ?? ''));
  const words = wordCount(body);
  if (words < 900) {
    throw new Error(`Kelime sayısı düşük: ${words} (hedef 1200–1500)`);
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
  const raw = await generateWithLLM(prompt);
  const post = parseGenerated(raw, topic, slug);
  const words = wordCount(post.bodyMarkdown);
  console.log(`Words: ${words}`);

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
