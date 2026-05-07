export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { find, findOne, ObjectId } from "@/lib/mongo-ops";

// 获取用户今日岗位分配
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  // 获取该用户的所有报名记录
  const signups = await find("signups", { phone: token.phone });

  // 临时方案：返回已选的时段信息
  const slots: Array<{ start: string; end: string; position?: string }> = [];
  for (const signup of signups) {
    const recruitmentId = (signup as any).recruitmentId;
    const selectedSlots = (signup as any).selectedSlots || [];
    
    // 获取活动信息
    let recObjectId;
    try {
      recObjectId = new ObjectId(recruitmentId);
    } catch {
      continue;
    }
    
    const recruitment = await findOne("recruitments", { _id: recObjectId });
    if (!recruitment) continue;
    
    // 检查是否是今天的活动
    if (recruitment.startDate !== date) continue;

    for (const slot of selectedSlots) {
      const hour = parseInt(slot);
      slots.push({
        start: `${String(hour).padStart(2, "0")}:00`,
        end: `${String(hour + 1).padStart(2, "0")}:00`,
      });
    }
  }

  return NextResponse.json({ slots });
}
