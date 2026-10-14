import { NextResponse } from "next/server";

export function rejectUnsafeMutation(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "cross-site" || (origin && origin !== requestOrigin)) {
    return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
  }

  return null;
}
