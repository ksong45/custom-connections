import { NextResponse } from "next/server";
import { listPuzzleDatesForMonth } from "~/lib/cavalier-daily";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const today = new Date();

  const year = Number(searchParams.get("year")) || today.getFullYear();
  const month = Number(searchParams.get("month")) || today.getMonth() + 1;

  const dates = await listPuzzleDatesForMonth(year, month);

  return NextResponse.json({ year, month, count: dates.length, dates });
}
