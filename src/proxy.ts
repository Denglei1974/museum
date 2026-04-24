import { NextRequest, NextResponse } from "next/server";

// 不需要登录就能访问的路径
const PUBLIC_PATHS = [
  "/signin",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/change-password",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路径直接放行
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/manifest.json")
  ) {
    return NextResponse.next();
  }

  // 检查 cookie
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // 验证 token 是否过期
  try {
    const data = JSON.parse(atob(token));
    if (Date.now() > data.exp) {
      const signinUrl = new URL("/signin", request.url);
      return NextResponse.redirect(signinUrl);
    }
  } catch {
    const signinUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/.*).*)", "/api/:path*"],
};
