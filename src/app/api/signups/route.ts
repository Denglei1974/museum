export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { findOne, insertOne, find } from "@/lib/mongo-ops";

// 获取某个招募的报名列表
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const recruitmentId = searchParams.get("recruitmentId");

  if (!recruitmentId) {
    return NextResponse.json(
      { message: "缺少招募ID" },
      { status: 400 },
    );
  }

  const signups = await find("signups", { recruitmentId });
  return NextResponse.json({ items: signups });
}

// 报名
export async function POST(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { recruitmentId } = await request.json();
  if (!recruitmentId) {
    return NextResponse.json(
      { message: "缺少招募ID" },
      { status: 400 },
    );
  }

  // 检查是否已报名
  const existing = await findOne("signups", {
    recruitmentId,
    phone: token.phone,
  });
  if (existing) {
    return NextResponse.json(
      { message: "您已报名" },
      { status: 400 },
    );
  }

  // 获取志愿者信息
  const volunteer = await findOne("volunteers", { phone: token.phone });

  const id = await insertOne("signups", {
    recruitmentId,
    phone: token.phone,
    username: token.username,
    role: token.role,
    volunteerName: (volunteer as any)?.name || token.username,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ message: "报名成功", id }, { status: 201 });
}
