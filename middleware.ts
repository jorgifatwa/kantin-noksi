// middleware.ts
import { NextResponse, type NextRequest } from "next/server"

export default function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === "/login"

  // NextAuth stores session JWT in a cookie. Try common cookie names.
  const token =
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Host-next-auth.session-token")?.value

  const isLoggedIn = Boolean(token)

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}