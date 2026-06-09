import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token =
    request.cookies.get("orbita_token")?.value ??
    request.headers.get("Authorization")?.replace("Bearer ", "");

  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
