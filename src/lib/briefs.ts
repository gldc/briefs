import { getCollection, type CollectionEntry } from 'astro:content';

export type Brief = CollectionEntry<'briefs'>;

const ID_DATE_RE = /^(\d{4})\/(\d{2})\/(\d{2})$/;

export function briefDate(entry: Brief): Date {
  if (entry.data.date) return entry.data.date;
  const m = entry.id.match(ID_DATE_RE);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  return new Date(0);
}

export function briefSlug(entry: Brief): string {
  return entry.id; // e.g. "2026/04/29"
}

export function briefHref(entry: Brief): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${entry.id}`;
}

export function briefIssueNumber(entry: Brief, all: Brief[]): number {
  const sorted = [...all].sort(
    (a, b) => briefDate(a).valueOf() - briefDate(b).valueOf()
  );
  return sorted.findIndex((b) => b.id === entry.id) + 1;
}

const TLDR_HEADING = /^#{1,3}\s*TL;?DR\b/im;
const NEXT_HEADING = /^#{1,3}\s/m;

/**
 * Extract a one-line summary: prefer the explicit `summary` frontmatter, then
 * the first bullet under TL;DR, then the first paragraph of the body.
 */
export function briefSummary(entry: Brief): string {
  if (entry.data.summary) return entry.data.summary;
  const body = entry.body ?? '';

  const tldrMatch = body.match(TLDR_HEADING);
  if (tldrMatch) {
    const after = body.slice(tldrMatch.index! + tldrMatch[0].length);
    const next = after.match(NEXT_HEADING);
    const block = (next ? after.slice(0, next.index) : after).trim();
    const firstBullet = block.split('\n').find((l) => l.trim().startsWith('-'));
    if (firstBullet) {
      return cleanup(firstBullet.replace(/^[-*]\s*/, ''));
    }
    const firstPara = block.split(/\n\s*\n/)[0];
    if (firstPara) return cleanup(firstPara);
  }

  const stripped = body
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/^#{1,6}\s.*$/gm, '')
    .trim();
  return cleanup(stripped.split(/\n\s*\n/)[0] || '');
}

function cleanup(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function briefTitle(entry: Brief): string {
  if (entry.data.title) return entry.data.title;
  const body = entry.body ?? '';
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  const m = entry.id.match(ID_DATE_RE);
  if (m) return `Brief — ${m[1]}-${m[2]}-${m[3]}`;
  return 'Brief';
}

const FORMATTER_LONG = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
});
const FORMATTER_SHORT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
});

export function formatLong(d: Date): string {
  return FORMATTER_LONG.format(d);
}

export function formatShort(d: Date): string {
  return FORMATTER_SHORT.format(d);
}

export async function getSortedBriefs(): Promise<Brief[]> {
  const all = await getCollection('briefs');
  return all.sort(
    (a, b) => briefDate(b).valueOf() - briefDate(a).valueOf()
  );
}
