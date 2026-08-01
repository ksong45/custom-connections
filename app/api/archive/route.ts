import { NextResponse } from "next/server";
import { fetchPuzzleForDate } from "~/lib/cavalier-daily";

export const revalidate = 3600;

const DEFAULT_DAYS = 30;
const MAX_DAYS = 90;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDays = Number(searchParams.get("days")) || DEFAULT_DAYS;
  const days = Math.min(Math.max(requestedDays, 1), MAX_DAYS);

  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d;
  });

  const results = await Promise.all(
    dates.map((d) => fetchPuzzleForDate(d).catch(() => null))
  );

  const puzzles = results.filter((r): r is NonNullable<typeof r> => r !== null);

  return NextResponse.json({ count: puzzles.length, puzzles });
}
