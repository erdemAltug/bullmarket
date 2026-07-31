import axios from 'axios';
import type { FxRate } from '@/types';

const TCMB_URL = 'https://www.tcmb.gov.tr/kurlar/today.xml';

interface ParsedCurrency {
  code: string;
  name: string;
  unit: number;
  forexBuying: number;
  forexSelling: number;
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  return Number(value.replace(',', '.')) || 0;
}

function extractAttr(tag: string, attr: string): string | undefined {
  const m = tag.match(new RegExp(`${attr}="([^"]+)"`, 'i'));
  return m?.[1];
}

function extractTag(block: string, tag: string): string | undefined {
  const m = block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
  return m?.[1]?.trim();
}

function parseCurrencies(xml: string): ParsedCurrency[] {
  const blocks = xml.match(/<Currency\b[^>]*>[\s\S]*?<\/Currency>/gi) ?? [];
  return blocks.map((block) => {
    const open = block.match(/<Currency\b[^>]*>/i)?.[0] ?? '';
    const code = extractAttr(open, 'CurrencyCode') ?? '';
    return {
      code,
      name: extractTag(block, 'Isim') || extractTag(block, 'CurrencyName') || code,
      unit: parseNumber(extractTag(block, 'Unit')) || 1,
      forexBuying: parseNumber(extractTag(block, 'ForexBuying')),
      forexSelling: parseNumber(extractTag(block, 'ForexSelling')),
    };
  });
}

/** Gram gold estimate from TCMB "XAU" / "Altın" when present; else USD * typical ratio omitted. */
function buildGoldRate(currencies: ParsedCurrency[]): FxRate | null {
  const gold = currencies.find(
    (c) =>
      c.code === 'XAU' ||
      c.name.toLowerCase().includes('altın') ||
      c.name.toLowerCase().includes('gold')
  );
  if (!gold || (!gold.forexBuying && !gold.forexSelling)) return null;
  return {
    code: 'GOLD',
    name: 'Gram Altın',
    unit: gold.unit,
    forexBuying: gold.forexBuying,
    forexSelling: gold.forexSelling,
  };
}

export async function fetchFxRates(codes: string[]): Promise<{
  rates: FxRate[];
  updatedAt: string;
}> {
  const { data: xml } = await axios.get<string>(TCMB_URL, {
    responseType: 'text',
    timeout: 10_000,
    headers: { Accept: 'application/xml, text/xml, */*' },
  });

  const dateMatch = xml.match(/Date="([^"]+)"/i);
  const updatedAt = dateMatch?.[1] ?? new Date().toISOString().slice(0, 10);

  const all = parseCurrencies(xml);
  const wanted = new Set(codes.map((c) => c.toUpperCase()));
  const rates: FxRate[] = all
    .filter((c) => wanted.has(c.code.toUpperCase()))
    .map((c) => ({
      code: c.code,
      name: c.name,
      unit: c.unit,
      forexBuying: c.forexBuying,
      forexSelling: c.forexSelling,
    }));

  if (wanted.has('GOLD') || wanted.has('XAU')) {
    const gold = buildGoldRate(all);
    if (gold) rates.push(gold);
  }

  return { rates, updatedAt };
}

export const DEFAULT_FX_CODES = ['USD', 'EUR', 'GBP', 'GOLD'];
