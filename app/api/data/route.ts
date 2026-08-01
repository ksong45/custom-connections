import { NextResponse } from "next/server";
import {
  fetchPuzzleForDate,
  fetchMostRecentPuzzle,
  parseDateString,
} from "~/lib/cavalier-daily";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const result = dateParam
    ? await fetchPuzzleForDate(parseDateString(dateParam))
    : await fetchMostRecentPuzzle();

  if (!result) {
    return NextResponse.json(
      {
        error: dateParam
          ? `No puzzle found for ${dateParam}`
          : "No recent puzzle found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
