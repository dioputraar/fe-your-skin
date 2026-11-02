import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rute terlindungi (Master Data)
const PROTECTED_PREFIXES = ["/brand", "/product", "/category", "/ingredient"];

// Rute auth (dilarang jika sudah login)
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Jika mengakses rute terproteksi tanpa token -> redirect ke login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika sudah memiliki token tapi mengakses halaman login/register -> redirect ke /brand
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/brand", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
