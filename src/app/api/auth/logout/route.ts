export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "已退出登录" });
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // 立即过期
    sameSite: "lax",
  });
  return response;
}
