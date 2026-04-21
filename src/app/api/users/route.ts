import { NextResponse } from "next/server";
import { findOne, insertOne } from "@/lib/mongo";
import { hashPassword } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const { username, id_card, user_type, phone, password } =
      await request.json();

    // 检查是否已存在
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
