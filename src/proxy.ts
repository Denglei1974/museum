import { NextRequest, NextResponse } from "next/server";

// 不需要登录就能访问的路径
const PUBLIC_PATHS = [
  "/signin",
  "/api/auth/login",
  "/api/auth/register",
  "/volunteerSignup", // 公开报名页面
  "/favicon.ico",
  "/images/signin.png",
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路径直接放行
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  // 检查 cookie
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    // 未登录 → 跳转登录页
    const signinUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signinUrl);
  }

  // 已登录 → 放行
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/addUser/:path*",
    "/api/users/:path*",
  ],
};
