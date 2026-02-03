import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPath = pathname.startsWith("/auth");

  if (!token && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth", request.url));
    
  }

  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth page - to allow backend auth API calls)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
};
