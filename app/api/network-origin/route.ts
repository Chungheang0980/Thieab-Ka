import { networkInterfaces } from "os";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const requestHost = forwardedHost ?? request.headers.get("host") ?? "";
  const port = requestHost.match(/:(\d+)$/)?.[1];
  const address = Object.values(networkInterfaces())
    .flat()
    .find((item) => item?.family === "IPv4" && !item.internal)?.address;

  if (!address) {
    return NextResponse.json({ origin: null }, { status: 404 });
  }

  return NextResponse.json({ origin: `http://${address}${port ? `:${port}` : ""}` });
}
