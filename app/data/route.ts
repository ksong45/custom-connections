import { optionsToResponse } from "~/lib/decode-options";

export function GET(request: Request) {
  return optionsToResponse(request);
}