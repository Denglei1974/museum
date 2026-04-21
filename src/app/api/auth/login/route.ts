import { NextRequest, NextResponse } from "next/server";
import { findOne } from "@/lib/mongo";
import { comparePassword } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { message: "请输入电话号码和密码" },
        { status: 400 },
      );
    }

    const user = await findOne("users", { phone });
    if (!user) {
      return NextResponse.json(
        { message: "电话号码或密码错误" },
        { status: 401 },
      );
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { message: "电话号码或密码错误" },
        { status: 401 },
      );
    }

    // 生成简单 token: base64 编码的用户信息
    const payload = {
      id: (user as any)._id,
      phone: user.phone,
      username: user.username,
      user_type: user.user_type,
      ts: Date.now(),
    };
    const token = btoa(JSON.stringify(payload));

    const response = NextResponse.json({
      message: "登录成功",
      user: {
        username: user.username,
        user_type: user.user_type,
        phone: user.phone,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 24 小时
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "服务器错误，请稍后重试" },
      { status: 500 },
    );
  }
}
