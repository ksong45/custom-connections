import { NextResponse } from "next/server";
import { gameOptionsSchema } from "~/lib/game-options";

/**
 * Shared handler for `/data?options=...` and `/play/data?options=...`.
 * Decodes the same base64 `options` param that `/play` uses and returns the
 * validated puzzle JSON.
 */
export function optionsToResponse(request: Request) {
  const raw = new URL(request.url).searchParams.get("options");

  if (!raw) {
    return NextResponse.json(
      { error: "Missing 'options' query param" },
      { status: 400 }
    );
  }

  try {
    // URLSearchParams turns '+' into ' ', so restore it; also accept base64url.
    const b64 = raw.replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(b64, "base64").toString("utf-8");
    const puzzle = gameOptionsSchema.parse(JSON.parse(json));

    return NextResponse.json(puzzle, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not decode 'options' param" },
      { status: 400 }
    );
  }
}