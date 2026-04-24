export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { Users, Volunteers, findOne } from "@/lib/mongo-ops";

/**
 * 用户注册 API（管理后台使用）
 */
export async function POST(request: NextRequest) {
  const { username, phone, password, role, mustChangePassword } =
    await request.json();

  if (!phone || !password) {
    return NextResponse.json(
      { message: "请填写手机号和密码" },
      { status: 400 },
    );
  }

  try {
    // 检查是否已存在
    const existing = await Users.findByPhone(phone);
    if (existing) {
      return NextResponse.json(
        { message: "该手机号已被注册" },
        { status: 400 },
      );
    }

    const { hashPassword } = await import("@/lib/crypto");
    const hashedPassword = await hashPassword(password);

    await Users.create({
      username: username || phone,
      phone,
      password: hashedPassword,
      role: role || "social_volunteer",
      mustChangePassword: mustChangePassword !== false,
    });

    return NextResponse.json(
      { message: "用户创建成功" },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json(
      { message: "创建失败，请稍后重试" },
      { status: 500 },
    );
  }
}
