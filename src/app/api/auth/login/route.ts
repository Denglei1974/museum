import { NextRequest, NextResponse } from "next/server";

/**
 * 登录 API 路由
 * 支持两种模式:
 *   1. SCF 代理模式 (生产) — 环境变量 SCF_API_BASE 存在时启用
 *   2. Data API 直连模式 (本地开发) — 无 SCF_API_BASE 时使用
 */

export async function POST(request: NextRequest) {
  const { phone, password } = await request.json();

  if (!phone || !password) {
    return NextResponse.json(
      { message: "请输入电话号码和密码" },
      { status: 400 },
    );
  }

  // 模式 1: SCF 代理（腾讯云部署）
  const scfBase = process.env.SCF_API_BASE;
  if (scfBase) {
    try {
      const res = await fetch(`${scfBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.token) {
        return NextResponse.json(
          { message: data.message || "登录失败" },
          { status: res.status || 401 },
        );
      }

      const response = NextResponse.json({
        message: data.message,
        user: data.user,
      });

      response.cookies.set("auth-token", data.token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24,
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

  // 模式 2: Data API 直连（本地开发）
  try {
    const { findOne } = await import("@/lib/mongo");
    const { comparePassword } = await import("@/lib/crypto");

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
      maxAge: 60 * 60 * 24,
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
