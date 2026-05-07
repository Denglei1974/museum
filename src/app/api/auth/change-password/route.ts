export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";

export async function POST(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { oldPassword, newPassword } = await request.json();
  if (!oldPassword || !newPassword) {
    return NextResponse.json(
      { message: "请填写完整" },
      { status: 400 },
    );
  }

  try {
    const { Users } = await import("@/lib/mongo-ops");
    const { comparePassword, hashPassword } = await import("@/lib/crypto");

    const user = await Users.findByPhone(token.phone);
    if (!user) {
      return NextResponse.json({ message: "用户不存在" }, { status: 404 });
    }

    const ok = await comparePassword(oldPassword, (user as any).password);
    if (!ok) {
      return NextResponse.json({ message: "原密码错误" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await Users.update(token.phone, {
      password: newHash,
      mustChangePassword: false,
    });

    return NextResponse.json({ message: "密码修改成功" });
  } catch {
    return NextResponse.json(
      { message: "服务器错误" },
      { status: 500 },
    );
  }
}
