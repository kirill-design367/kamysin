import data from '@/content/site.json';

export type Site = typeof data;
export const site: Site = data;

/** Префикс базового пути (нужен для GitHub Pages, где сайт в подпапке /kamysin). */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Возвращает корректный путь до статичного файла (картинки) с учётом basePath. */
export function asset(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  return BASE + (path.startsWith('/') ? path : '/' + path);
}

/** Разбирает строку-число вида "10 000+" на числовую цель для счётчика и суффикс. */
export function parseNum(value: string): { count: number | null; suffix: string } {
  const m = String(value).match(/^([\d\s ]+)(.*)$/);
  if (!m) return { count: null, suffix: '' };
  const n = parseInt(m[1].replace(/[\s ]/g, ''), 10);
  if (Number.isNaN(n)) return { count: null, suffix: '' };
  return { count: n, suffix: m[2] };
}
