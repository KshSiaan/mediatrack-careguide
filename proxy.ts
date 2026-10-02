import { type NextRequest, NextResponse } from "next/server";

const sessionCookieNames = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

export function proxy(request: NextRequest) {
  const hasSessionCookie = sessionCookieNames.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL(hasSessionCookie ? "/admin/d" : "/auth/signin", request.url),
    );
  }

  if (!hasSessionCookie) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/admin/:path*"] };
