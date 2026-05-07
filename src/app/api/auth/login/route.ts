export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth/token";

export async function POST(request: NextRequest) {
  const { phone, password } = await request.json();

  if (!phone || !password) {
    return NextResponse.json(
      { message: "请输入电话号码和密码" },
      { status: 400 },
    );
  }

  try {
    const { Users } = await import("@/lib/mongo-ops");
    const { comparePassword } = await import("@/lib/crypto");

    const user = await Users.findByPhone(phone);
    if (!user) {
      return NextResponse.json(
        { message: "电话号码或密码错误" },
        { status: 401 },
      );
    }

    const ok = await comparePassword(password, (user as any).password);
    if (!ok) {
      return NextResponse.json(
        { message: "电话号码或密码错误" },
        { status: 401 },
      );
    }

    const userObj = user as Record<string, unknown>;
    const role = (userObj.role as string) || "social_volunteer";
    const mustChangePassword = !!userObj.mustChangePassword;

    const token = generateToken({
      id: String(userObj._id || ""),
      phone: userObj.phone as string,
      role,
      username: (userObj.username as string) || "",
      mustChangePassword,
    });

    const response = NextResponse.json({
      message: "登录成功",
      user: {
        username: userObj.username,
        role,
        phone: userObj.phone,
        mustChangePassword,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "服务器错误，请稍后重试" },
      { status: 500 },
    );
  }
}
