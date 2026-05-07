export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { findOne, insertOne, find, ObjectId } from "@/lib/mongo-ops";

// 报名
export async function POST(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { recruitmentId, selectedSlots } = body;
  
  if (!recruitmentId) {
    return NextResponse.json({ message: "缺少活动ID" }, { status: 400 });
  }
  
  if (!selectedSlots || !Array.isArray(selectedSlots) || selectedSlots.length < 2) {
    return NextResponse.json({ message: "请选择至少 2 个时段" }, { status: 400 });
  }

  if (selectedSlots.length > 6) {
    return NextResponse.json({ message: "最多选择 6 个时段" }, { status: 400 });
  }

  // 检查是否已报名
  const existing = await findOne("signups", {
    recruitmentId,
    phone: token.phone,
  });
  if (existing) {
    return NextResponse.json({ message: "您已报名该活动" }, { status: 400 });
  }

  // 获取招募信息 — 字符串转 ObjectId
  let recObjectId;
  try {
    recObjectId = new ObjectId(recruitmentId);
  } catch {
    return NextResponse.json({ message: "活动ID格式错误" }, { status: 400 });
  }

  const recruitment = await findOne("recruitments", { _id: recObjectId });
  if (!recruitment) {
    return NextResponse.json({ message: "活动不存在" }, { status: 404 });
  }

  // 检查余额
  const maxPerSlot = recruitment.maxPerSlot || 4;
  const allSignups = await find("signups", { recruitmentId });
  const slotTaken: Record<number, number> = {};
  for (const signup of allSignups) {
    const slots = (signup as any).selectedSlots || [];
    for (const s of slots) {
      const hour = parseInt(s);
      slotTaken[hour] = (slotTaken[hour] || 0) + 1;
    }
  }

  for (const slot of selectedSlots) {
    const hour = parseInt(slot);
    const taken = slotTaken[hour] || 0;
    if (taken >= maxPerSlot) {
      const startStr = String(hour).padStart(2, "0");
      return NextResponse.json(
        { message: `${startStr}:00-${String(hour + 1).padStart(2, "0")}:00 名额已满` },
        { status: 400 },
      );
    }
  }

  // 检查连续
  const sorted = [...selectedSlots].sort((a, b) => parseInt(a) - parseInt(b));
  for (let i = 1; i < sorted.length; i++) {
    if (parseInt(sorted[i]) !== parseInt(sorted[i - 1]) + 1) {
      return NextResponse.json({ message: "请选择连续的时间段" }, { status: 400 });
    }
  }

  // 插入报名
  const id = await insertOne("signups", {
    recruitmentId,
    phone: token.phone,
    username: token.username,
    role: token.role,
    selectedSlots: sorted,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ message: "报名成功", id }, { status: 201 });
}

// 获取某个招募的报名列表（管理员用）
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const recruitmentId = searchParams.get("recruitmentId");

  if (!recruitmentId) {
    return NextResponse.json({ message: "缺少招募ID" }, { status: 400 });
  }

  const signups = await find("signups", { recruitmentId });
  return NextResponse.json({ items: signups });
}
