export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { find } from "@/lib/mongo-ops";

export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || new Date().getFullYear().toString();
  const category = searchParams.get("category") || "";

  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;

  // 获取所有签到记录
  const records = await find(
    "checkins",
    { status: "confirmed", date: { $gte: startOfYear, $lte: endOfYear } },
    { sort: { date: -1 } }
  ) as unknown as Array<{ phone: string; duration: number; date: string; checkinTime: string; checkoutTime: string }>;

  // 如果需要按类别筛选，获取志愿者列表并过滤
  let filteredRecords = records;
  if (category) {
    const volunteers = await find("volunteers", { volunteerType: category }) as unknown as Array<{ phone: string }>;
    const volunteerPhones = new Set(volunteers.map((v) => v.phone));
    filteredRecords = records.filter((r) => volunteerPhones.has(r.phone));
  }

  // 关联志愿者姓名
  const phoneToName: Record<string, string> = {};
  const volunteerData = await find("volunteers", {}) as unknown as Array<{ phone: string; name: string }>;
  for (const v of volunteerData) {
    phoneToName[v.phone] = v.name;
  }

  const items = filteredRecords.map((r) => ({
    phone: r.phone,
    name: phoneToName[r.phone] || r.phone,
    date: r.date,
    duration: r.duration || 0,
    checkinTime: r.checkinTime || "",
    checkoutTime: r.checkoutTime || "",
  }));

  return NextResponse.json({ items });
}
