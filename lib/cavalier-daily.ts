import { gameOptionsSchema, type GameOptions } from "~/lib/game-options";

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;

export function getArticleUrl(date: Date): string {
  const year = date.getFullYear();
  const monthNum = String(date.getMonth() + 1).padStart(2, "0");
  const monthName = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  return `https://www.cavalierdaily.com/article/${year}/${monthNum}/cavalier-clusters-${monthName}-${day}`;
}

export function extractPuzzleFromHtml(html: string): GameOptions | null {
  const match = html.match(
    /custom-connections-2\.vercel\.app\/play\?options=([A-Za-z0-9+/=%]+)/
  );
  if (!match) return null;

  try {
    const encoded = decodeURIComponent(match[1]);
    const jsonString = Buffer.from(encoded, "base64").toString("utf-8");
    const parsed = JSON.parse(jsonString);
    return gameOptionsSchema.parse(parsed);
  } catch {
    return null;
  }
}

export interface DatedPuzzle {
  date: string;
  articleUrl: string;
  puzzle: GameOptions;
}

export async function fetchPuzzleForDate(
  date: Date
): Promise<DatedPuzzle | null> {
  const articleUrl = getArticleUrl(date);
  const res = await fetch(articleUrl, { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const html = await res.text();
  const puzzle = extractPuzzleFromHtml(html);
  if (!puzzle) return null;

  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    articleUrl,
    puzzle,
  };
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function fetchMostRecentPuzzle(
  maxDaysBack = 14
): Promise<DatedPuzzle | null> {
  const today = new Date();
  for (let i = 0; i < maxDaysBack; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const result = await fetchPuzzleForDate(d);
    if (result) return result;
  }
  return null;
}

export async function listPuzzleDatesForMonth(
  year: number,
  month: number
): Promise<Array<{ date: string; articleUrl: string }>> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month - 1, i + 1)
  );

  const results = await Promise.all(
    dates.map((d) => fetchPuzzleForDate(d).catch(() => null))
  );

  return results
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .map(({ date, articleUrl }) => ({ date, articleUrl }));
}
