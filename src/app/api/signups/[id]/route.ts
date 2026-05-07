export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { findOne, find, ObjectId } from "@/lib/mongo-ops";

// 获取某个招募的可用时段列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  // 字符串转 ObjectId
  let recObjectId;
  try {
    recObjectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ message: "活动ID格式错误" }, { status: 400 });
  }

  // 获取招募信息
  const recruitment = await findOne("recruitments", { _id: recObjectId });
  if (!recruitment) {
    return NextResponse.json({ message: "活动不存在" }, { status: 404 });
  }

  // 解析开始结束时间
  const startH = parseInt((recruitment.startTime || "09:00").split(":")[0]);
  const endH = parseInt((recruitment.endTime || "17:00").split(":")[0]);
  const maxPerSlot = recruitment.maxPerSlot || 4;

  // 获取已有报名记录，统计每个时段占用情况
  const allSignups = await find("signups", { recruitmentId: id });
  const slotTaken: Record<number, number> = {};
  for (const signup of allSignups) {
    const slots = (signup as any).selectedSlots || [];
    for (const s of slots) {
      const hour = parseInt(s);
      slotTaken[hour] = (slotTaken[hour] || 0) + 1;
    }
  }

  // 生成时段列表
  const slots: Array<{ hour: number; label: string; remaining: number; disabled: boolean }> = [];
  for (let h = startH; h < endH; h++) {
    const taken = slotTaken[h] || 0;
    const remaining = Math.max(0, maxPerSlot - taken);
    slots.push({
      hour: h,
      label: `${String(h).padStart(2, "0")}:00-${String(h + 1).padStart(2, "0")}:00`,
      remaining,
      disabled: remaining === 0,
    });
  }

  return NextResponse.json({
    recruitment: {
      title: recruitment.title,
      startDate: recruitment.startDate,
      startTime: recruitment.startTime,
      endTime: recruitment.endTime,
      maxPerSlot,
    },
    slots,
  });
}
