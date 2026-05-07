export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { find, findOne, ObjectId } from "@/lib/mongo-ops";

// 获取志愿者荣誉时长数据（按年度）
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") || token.phone;
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  // 获取该用户该年度的所有报名记录
  const signups = await find("signups", { phone });

  // 筛选该年度的活动
  let count = 0;
  let totalHours = 0;

  for (const signup of signups) {
    const recruitmentId = (signup as any).recruitmentId;
    if (!recruitmentId) continue;

    let recObjectId;
    try {
      recObjectId = new ObjectId(recruitmentId);
    } catch {
      continue;
    }

    const recruitment = await findOne("recruitments", { _id: recObjectId });
    if (!recruitment) continue;

    // 检查活动日期是否在该年度
    const startDate = recruitment.startDate;
    if (!startDate) continue;
    const activityYear = parseInt(startDate.split("-")[0]);
    if (activityYear !== year) continue;

    // 计算时长
    count++;
    if (recruitment.startTime && recruitment.endTime) {
      const [sh, sm] = recruitment.startTime.split(":").map(Number);
      const [eh, em] = recruitment.endTime.split(":").map(Number);
      const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
      totalHours += hours;
    }
  }

  return NextResponse.json({
    count,
    hours: Math.round(totalHours * 10) / 10,
  });
}
