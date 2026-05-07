export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { find } from "@/lib/mongo-ops";

// 获取志愿者的报名/参与活动记录
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") || token.phone;

  // 志愿者只能查自己的
  if (!token.role?.includes("admin") && phone !== token.phone) {
    return NextResponse.json({ message: "无权限" }, { status: 403 });
  }

  // 以报名记录为准（signups 表）
  const signups = await find("signups", { phone }, { sort: { createdAt: -1 } });

  // 获取对应的招募信息
  const recruitmentIds = [...new Set(
    (signups as any[]).map((s: any) => s.recruitmentId).filter(Boolean)
  )];

  let recruitments: any[] = [];
  if (recruitmentIds.length > 0) {
    const { ObjectId } = await import("@/lib/mongo-ops");
    const objIds = recruitmentIds.map((id: string) => {
      try { return new ObjectId(id); } catch { return id; }
    });
    recruitments = await find("recruitments", { _id: { $in: objIds } });
  }

  // 合并数据
  const activities = (signups as any[]).map((signup: any) => {
    const recruitment = recruitments.find((r: any) => {
      const rid = String(r._id);
      return rid === signup.recruitmentId;
    });

    return {
      id: String(signup._id),
      recruitmentId: signup.recruitmentId || "",
      name: recruitment?.title || "未知活动",
      date: recruitment?.startDate || signup.createdAt?.split("T")[0] || "",
      location: recruitment?.location || "",
      description: recruitment?.description || "",
      startTime: recruitment?.startTime || "",
      endTime: recruitment?.endTime || "",
      duration: calcDuration(recruitment),
      status: signup.status || "confirmed",
      createdAt: signup.createdAt || "",
    };
  });

  return NextResponse.json({ items: activities });
}

function calcDuration(recruitment: any): number {
  if (!recruitment?.startTime || !recruitment?.endTime) return 0;
  const [sh, sm] = recruitment.startTime.split(":").map(Number);
  const [eh, em] = recruitment.endTime.split(":").map(Number);
  return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
}
