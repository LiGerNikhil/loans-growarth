import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { verifyConnectorToken } from "@/lib/connect-auth";

const CONNECTOR_COOKIE = "connector.session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes: use Auth.js session ──
  if (pathname.startsWith("/admin")) {
    const session = await auth();
    if (pathname === "/admin/login") return NextResponse.next();
    if (pathname.startsWith("/api/auth")) return NextResponse.next();
    if (!session?.user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Connector routes: use JWT cookie ──
  if (pathname.startsWith("/connect")) {
    if (pathname === "/connect/login") return NextResponse.next();
    if (pathname.startsWith("/connect/signup")) return NextResponse.next();
    if (pathname.startsWith("/connect/api")) return NextResponse.next();

    const token = request.cookies.get(CONNECTOR_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/connect/login", request.url));
    }

    const payload = await verifyConnectorToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/connect/login", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/connect/:path*"],
};
