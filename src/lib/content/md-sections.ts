import type { ContentSection } from '@/content/types';

export function slugifyHeading(heading: string): string {
  return heading
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
    .replace(/^-|-$/g, '');
}

/** Split markdown body into ContentSection[] using ## headings. */
export function markdownToSections(body: string): ContentSection[] {
  const lines = body.replace(/\r\n/g, '\n').trim().split('\n');
  const sections: ContentSection[] = [];
  let current: ContentSection | null = null;
  let paraBuf: string[] = [];
  let bullets: string[] = [];

  function flushPara() {
    if (!current) return;
    const text = paraBuf.join(' ').trim();
    if (text) current.paragraphs.push(text);
    paraBuf = [];
  }

  function flushBullets() {
    if (!current || !bullets.length) return;
    current.bullets = [...(current.bullets ?? []), ...bullets];
    bullets = [];
  }

  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      flushPara();
      flushBullets();
      if (current) sections.push(current);
      const heading = h2[1].trim();
      current = {
        id: slugifyHeading(heading),
        heading,
        paragraphs: [],
      };
      continue;
    }

    if (!current) continue;

    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      flushPara();
      bullets.push(bullet[1].trim());
      continue;
    }

    if (line.trim() === '') {
      flushPara();
      flushBullets();
      continue;
    }

    flushBullets();
    paraBuf.push(line.trim());
  }

  flushPara();
  flushBullets();
  if (current) sections.push(current);
  return sections;
}
