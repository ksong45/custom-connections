import { NextResponse } from "next/server";
import { fetchPuzzleForDate } from "~/lib/cavalier-daily";

export const revalidate = 3600;

export async function GET() {
  const today = new Date();
  const result = await fetchPuzzleForDate(today);

  if (!result) {
    return NextResponse.json(
      { error: "No puzzle found for today" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
