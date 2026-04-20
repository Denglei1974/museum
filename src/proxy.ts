import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// 1. 指定受保护和公共路由
//const protectedRoutes = ['/dashboard','/volunteerSignup']
const publicRoutes = ["/signin", "/"];

export default async function proxy(req: NextRequest) {
  // 2. 检查当前路由是受保护的还是公共的
  const path = req.nextUrl.pathname;
  //const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path);

  // 3 . 如果当前路由既是公共的，则继续处理请求
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. 获得session
  const session = await getServerSession(authOptions);

  // 5. 如果用户未经身份验证，则重定向到 /signin,否则继续处理请求
  if (!session) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  } else {
    return NextResponse.next();
  }
}

// Proxy 不应运行的路由
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
