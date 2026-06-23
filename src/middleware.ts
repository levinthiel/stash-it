import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isAuthenticated } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const authed = isAuthenticated(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (authed) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname === "/login") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/spendings",
    "/grocery",
    "/api/pockets",
    "/api/pockets/:path*",
    "/api/spendings",
    "/api/spendings/:path*",
    "/api/groceries",
    "/api/groceries/:path*",
  ],
};
