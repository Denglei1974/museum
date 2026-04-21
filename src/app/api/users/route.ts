import { NextResponse } from "next/server";

/**
 * 用户注册 API 路由
 * 支持两种模式:
 *   1. SCF 代理模式 (生产) — 环境变量 SCF_API_BASE 存在时启用
 *   2. Data API 直连模式 (本地开发) — 无 SCF_API_BASE 时使用
 */

export async function POST(request: Request) {
  const { username, id_card, user_type, phone, password } =
    await request.json();

  // 模式 1: SCF 代理
  const scfBase = process.env.SCF_API_BASE;
  if (scfBase) {
    try {
      const res = await fetch(`${scfBase}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, id_card, user_type, phone, password }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch {
      return NextResponse.json(
        { message: "服务器错误，请稍后重试" },
        { status: 500 },
      );
    }
  }

  // 模式 2: Data API 直连
  try {
    const { findOne, insertOne } = await import("@/lib/mongo");
    const { hashPassword } = await import("@/lib/crypto");

    const existingPhone = await findOne("users", { phone });
    if (existingPhone) {
      return NextResponse.json(
        { message: "该电话号码已被注册" },
        { status: 400 },
      );
    }

    const existingIdCard = await findOne("users", { id_card });
    if (existingIdCard) {
      return NextResponse.json(
        { message: "该身份证号已被注册" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);
    await insertOne("users", {
      username,
      id_card,
      user_type,
      phone,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "用户创建成功" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "创建用户失败，请稍后重试" },
      { status: 500 },
    );
  }
}
