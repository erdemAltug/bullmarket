/**
 * Creates Bullsye product dashboards in PostHog (dashboard-as-code).
 *
 *   POSTHOG_PERSONAL_API_KEY=phx_... npx tsx scripts/posthog-dashboards.ts
 *   npx tsx scripts/posthog-dashboards.ts --dry-run   # print payloads only
 *
 * Optional env: POSTHOG_HOST (default https://eu.posthog.com),
 * POSTHOG_PROJECT_ID (default @current).
 *
 * Idempotent: dashboards are found by name; insights already on a dashboard
 * (same name) are skipped, so re-running only adds what is missing.
 */

const HOST = (process.env.POSTHOG_HOST || 'https://eu.posthog.com').replace(/\/$/, '');
const PROJECT = process.env.POSTHOG_PROJECT_ID || '@current';
const KEY = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
const DRY = process.argv.includes('--dry-run');

type Json = Record<string, unknown>;

// ---------- query builders ----------

const ev = (event: string, extra: Json = {}): Json => ({
  kind: 'EventsNode',
  event,
  name: event,
  ...extra,
});

const pathRegex = (regex: string): Json => ({
  key: '$pathname',
  value: regex,
  operator: 'regex',
  type: 'event',
});

function trends(
  series: Json[],
  opts: {
    days?: number;
    interval?: 'day' | 'week' | 'month';
    display?: string;
    breakdown?: string;
    breakdownLimit?: number;
  } = {}
): Json {
  return {
    kind: 'InsightVizNode',
    source: {
      kind: 'TrendsQuery',
      series,
      interval: opts.interval ?? 'day',
      dateRange: { date_from: `-${opts.days ?? 30}d` },
      filterTestAccounts: true,
      ...(opts.breakdown
        ? {
            breakdownFilter: {
              breakdown: opts.breakdown,
              breakdown_type: 'event',
              breakdown_limit: opts.breakdownLimit ?? 10,
            },
          }
        : {}),
      trendsFilter: { display: opts.display ?? 'ActionsLineGraph' },
    },
  };
}

function funnel(steps: Json[], opts: { days?: number; windowDays?: number; breakdown?: string } = {}): Json {
  return {
    kind: 'InsightVizNode',
    source: {
      kind: 'FunnelsQuery',
      series: steps,
      dateRange: { date_from: `-${opts.days ?? 30}d` },
      filterTestAccounts: true,
      ...(opts.breakdown
        ? { breakdownFilter: { breakdown: opts.breakdown, breakdown_type: 'event' } }
        : {}),
      funnelsFilter: {
        funnelVizType: 'steps',
        funnelOrderType: 'ordered',
        funnelWindowInterval: opts.windowDays ?? 14,
        funnelWindowIntervalUnit: 'day',
      },
    },
  };
}

function retention(target: string, returning: string): Json {
  return {
    kind: 'InsightVizNode',
    source: {
      kind: 'RetentionQuery',
      dateRange: { date_from: '-8w' },
      filterTestAccounts: true,
      retentionFilter: {
        period: 'Week',
        totalIntervals: 8,
        retentionType: 'retention_first_time',
        targetEntity: { id: target, type: 'events', name: target },
        returningEntity: { id: returning, type: 'events', name: returning },
      },
    },
  };
}

function hogql(query: string): Json {
  return { kind: 'DataTableNode', source: { kind: 'HogQLQuery', query } };
}

// ---------- dashboards ----------

type Insight = { name: string; description: string; query: Json };
type Dashboard = { name: string; description: string; insights: Insight[] };

const KEY_ACTIONS = [
  'watchlist_add',
  'alert_create',
  'inventory_add',
  'digest_subscribe',
  'pro_waitlist_join',
];

const DASHBOARDS: Dashboard[] = [
  {
    name: 'Bullsye · Büyüme',
    description: 'Trafik, kayıt ve aktivasyon — haftalık bakılacak ana pano.',
    insights: [
      {
        name: 'Günlük / haftalık aktif kullanıcı',
        description: 'Benzersiz ziyaretçi (DAU) ve 7 günlük aktif (WAU).',
        query: trends(
          [
            ev('$pageview', { math: 'dau', custom_name: 'Günlük aktif' }),
            ev('$pageview', { math: 'weekly_active', custom_name: 'Haftalık aktif' }),
          ],
          { days: 60 }
        ),
      },
      {
        name: 'Yeni kayıtlar (günlük)',
        description: 'signup_completed — Google dahil tüm yeni hesaplar.',
        query: trends([ev('signup_completed', { math: 'total' })], {
          days: 60,
          display: 'ActionsBar',
        }),
      },
      {
        name: 'Son 30 gün yeni kayıt',
        description: 'Tek sayı.',
        query: trends([ev('signup_completed', { math: 'total' })], {
          display: 'BoldNumber',
        }),
      },
      {
        name: 'Kayıt hunisi: ana sayfa → CTA → kayıt → ilk takip',
        description:
          'Ana sayfayı gören kullanıcının ne kadarı kayıt butonuna basıyor, kayıt oluyor ve ilk izleme/alarmını kuruyor.',
        query: funnel([
          ev('$pageview', { properties: [pathRegex('^/$')], custom_name: 'Ana sayfa' }),
          ev('landing_signup_click', { custom_name: 'Kayıt butonu' }),
          ev('signup_completed', { custom_name: 'Kayıt' }),
          ev('watchlist_add', { custom_name: 'İlk izleme' }),
        ]),
      },
      {
        name: 'Ana sayfa CTA tıklamaları (yerleşime göre)',
        description: 'Hangi kayıt butonu çalışıyor: hero, picks, benefits, final.',
        query: trends([ev('landing_signup_click', { math: 'total' })], {
          breakdown: 'where',
          display: 'ActionsBarValue',
        }),
      },
      {
        name: 'Trafik kaynakları',
        description: 'Benzersiz ziyaretçi, gelen alan adına göre.',
        query: trends([ev('$pageview', { math: 'dau' })], {
          breakdown: '$referring_domain',
          display: 'ActionsTable',
          breakdownLimit: 15,
        }),
      },
      {
        name: 'Kampanya kaynakları (UTM)',
        description: 'utm_source etiketli ziyaretler — paylaşım, e-posta, reklam.',
        query: trends([ev('$pageview', { math: 'dau' })], {
          breakdown: 'utm_source',
          display: 'ActionsTable',
        }),
      },
      {
        name: 'Mobil / masaüstü',
        description: 'Benzersiz ziyaretçi, cihaz tipine göre.',
        query: trends([ev('$pageview', { math: 'dau' })], {
          breakdown: '$device_type',
          display: 'ActionsPie',
        }),
      },
      {
        name: 'Kayıt sonrası haftalık geri dönüş',
        description: 'Kayıt olan kullanıcı sonraki haftalarda siteye dönüyor mu?',
        query: retention('signup_completed', '$pageview'),
      },
    ],
  },
  {
    name: 'Bullsye · Ürün kullanımı',
    description: 'Kullanıcılar ne yapıyor, nereye bakıyor, hangi özellik tutuyor.',
    insights: [
      {
        name: 'Temel aksiyonlar (günlük)',
        description: 'İzleme, alarm, envanter, sabah özeti, Pro bekleme listesi.',
        query: trends(
          KEY_ACTIONS.map((e) => ev(e, { math: 'total' })),
          { days: 30 }
        ),
      },
      {
        name: 'En çok ziyaret edilen sayfalar',
        description: 'Benzersiz ziyaretçi, sayfa yoluna göre.',
        query: trends([ev('$pageview', { math: 'dau' })], {
          breakdown: '$pathname',
          display: 'ActionsTable',
          breakdownLimit: 20,
        }),
      },
      {
        name: 'En çok bakılan semboller',
        description: 'BİST / NASDAQ / kripto / fon sembol sayfaları.',
        query: trends(
          [
            ev('$pageview', {
              math: 'dau',
              properties: [pathRegex('^/(bist|nasdaq|kripto|fon)/[^/]+$')],
            }),
          ],
          { breakdown: '$pathname', display: 'ActionsTable', breakdownLimit: 25 }
        ),
      },
      {
        name: 'En çok izlemeye alınan semboller',
        description: 'watchlist_add, sembole göre.',
        query: trends([ev('watchlist_add', { math: 'total' })], {
          breakdown: 'symbol',
          display: 'ActionsBarValue',
          breakdownLimit: 15,
        }),
      },
      {
        name: 'Kurulan alarmlar (türe göre)',
        description: 'alert_create — fiyat, % hareket, RSI, skor.',
        query: trends([ev('alert_create', { math: 'total' })], {
          breakdown: 'kind',
          display: 'ActionsPie',
        }),
      },
      {
        name: 'İzleme listesine ekleme kaynağı',
        description: 'Sembol sayfası butonu mu, hızlı ekleme mi, tarama tablosu mu?',
        query: trends([ev('watchlist_add', { math: 'total' })], {
          breakdown: 'source',
          display: 'ActionsBarValue',
        }),
      },
      {
        name: 'Aktivasyon hunisi: kayıt → izleme → alarm',
        description: 'Yeni hesapların ne kadarı ilk 7 günde takip kuruyor.',
        query: funnel(
          [ev('signup_completed'), ev('watchlist_add'), ev('alert_create')],
          { windowDays: 7 }
        ),
      },
      {
        name: 'Arama: açma → seçme',
        description: 'Arama kutusunu açanların ne kadarı bir sonuca gidiyor.',
        query: funnel([ev('search_open'), ev('search_select')], { windowDays: 1 }),
      },
      {
        name: 'Ziyaretçi yolları (ana sayfadan)',
        description: 'Ana sayfadan sonra hangi sayfalara gidiliyor.',
        query: {
          kind: 'InsightVizNode',
          source: {
            kind: 'PathsQuery',
            dateRange: { date_from: '-30d' },
            filterTestAccounts: true,
            pathsFilter: {
              includeEventTypes: ['$pageview'],
              startPoint: '/',
              stepLimit: 5,
            },
          },
        },
      },
      {
        name: 'Son aksiyonlar — kim ne yaptı',
        description: 'Kayıtlı kullanıcıların son 100 önemli aksiyonu.',
        query: hogql(`
          SELECT
            timestamp,
            coalesce(person.properties.email, distinct_id) AS kullanici,
            event AS aksiyon,
            coalesce(properties.symbol, properties.where, properties.source, '') AS detay
          FROM events
          WHERE event IN ('signup_completed', 'watchlist_add', 'watchlist_remove',
                          'alert_create', 'inventory_add', 'digest_subscribe',
                          'pro_waitlist_join', 'alert_email_sent')
            AND timestamp > now() - INTERVAL 14 DAY
          ORDER BY timestamp DESC
          LIMIT 100
        `),
      },
      {
        name: 'En aktif kullanıcılar (14 gün)',
        description: 'Önemli aksiyon sayısına göre ilk 25 kullanıcı.',
        query: hogql(`
          SELECT
            coalesce(person.properties.email, distinct_id) AS kullanici,
            count() AS aksiyon,
            countIf(event = 'watchlist_add') AS izleme,
            countIf(event = 'alert_create') AS alarm,
            countIf(event = 'inventory_add') AS envanter,
            max(timestamp) AS son_gorulme
          FROM events
          WHERE event IN ('watchlist_add', 'alert_create', 'inventory_add',
                          'digest_subscribe', 'search_select')
            AND timestamp > now() - INTERVAL 14 DAY
          GROUP BY kullanici
          ORDER BY aksiyon DESC
          LIMIT 25
        `),
      },
    ],
  },
  {
    name: 'Bullsye · E-posta & dönüşüm',
    description: 'Sabah özeti, alarm e-postaları, kayıt banner A/B ve Pro ilgisi.',
    insights: [
      {
        name: 'Gönderilen alarm e-postaları',
        description: 'alert_email_sent — sekme kapalıyken (cron) ve açıkken (tab).',
        query: trends([ev('alert_email_sent', { math: 'total' })], {
          breakdown: 'source',
          display: 'ActionsBar',
        }),
      },
      {
        name: 'Sabah özeti abonelikleri',
        description: 'Abone olan / çıkan, günlük.',
        query: trends(
          [ev('digest_subscribe', { math: 'total' }), ev('digest_unsubscribe', { math: 'total' })],
          { days: 60, display: 'ActionsBar' }
        ),
      },
      {
        name: 'Kayıt banner A/B: görüntüleme → tıklama',
        description: 'softgate_view → softgate_click, metin varyantına göre (a / b).',
        query: funnel([ev('softgate_view'), ev('softgate_click')], {
          windowDays: 1,
          breakdown: 'variant',
        }),
      },
      {
        name: 'Pro bekleme listesi (kaynağa göre)',
        description: 'pro_waitlist_join — alarmlar mı, portföy mü?',
        query: trends([ev('pro_waitlist_join', { math: 'total' })], {
          days: 90,
          breakdown: 'source',
          display: 'ActionsBarValue',
        }),
      },
      {
        name: 'E-postadan gelen ziyaretler',
        description: 'utm_source=email ile gelen benzersiz ziyaretçi (özet + alarm).',
        query: trends(
          [
            ev('$pageview', {
              math: 'dau',
              properties: [
                { key: 'utm_source', value: ['email'], operator: 'exact', type: 'event' },
              ],
            }),
          ],
          { breakdown: 'utm_medium', display: 'ActionsBar' }
        ),
      },
    ],
  },
];

// ---------- API ----------

async function api<T>(method: string, path: string, body?: Json): Promise<T> {
  const res = await fetch(`${HOST}/api/projects/${PROJECT}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

type DashboardRow = { id: number; name: string; tiles?: { insight?: { name?: string } | null }[] };

async function findDashboard(name: string): Promise<DashboardRow | null> {
  const list = await api<{ results: DashboardRow[] }>('GET', '/dashboards/?limit=200');
  const hit = list.results.find((d) => d.name === name);
  return hit ? api<DashboardRow>('GET', `/dashboards/${hit.id}/`) : null;
}

async function main() {
  if (DRY) {
    console.log(JSON.stringify(DASHBOARDS, null, 2));
    return;
  }
  if (!KEY) {
    console.error('POSTHOG_PERSONAL_API_KEY eksik. PostHog → Settings → Personal API keys.');
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const d of DASHBOARDS) {
    let dash = await findDashboard(d.name);
    if (!dash) {
      dash = await api<DashboardRow>('POST', '/dashboards/', {
        name: d.name,
        description: d.description,
        pinned: true,
      });
      console.log(`+ Pano: ${d.name}`);
    } else {
      console.log(`= Pano var: ${d.name}`);
    }
    const existing = new Set(
      (dash.tiles ?? []).map((t) => t.insight?.name).filter(Boolean) as string[]
    );

    for (const ins of d.insights) {
      if (existing.has(ins.name)) {
        skipped++;
        continue;
      }
      try {
        await api('POST', '/insights/', {
          name: ins.name,
          description: ins.description,
          query: ins.query,
          dashboards: [dash.id],
          saved: true,
        });
        created++;
        console.log(`  + ${ins.name}`);
      } catch (e) {
        failures.push(`${d.name} / ${ins.name}: ${(e as Error).message}`);
        console.error(`  ! ${ins.name}`);
      }
    }
  }

  console.log(`\n${created} grafik eklendi, ${skipped} zaten vardı.`);
  if (failures.length) {
    console.error(`\n${failures.length} grafik eklenemedi:\n- ${failures.join('\n- ')}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
