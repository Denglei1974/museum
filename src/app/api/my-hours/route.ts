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
  const phone = searchParams.get("phone") || token.phone;
  const year = searchParams.get("year") || new Date().getFullYear().toString();

  // 志愿者只能查自己的
  if (
    !token.role?.includes("admin") &&
    !token.role?.includes("leader") &&
    phone !== token.phone
  ) {
    return NextResponse.json({ message: "无权限" }, { status: 403 });
  }

  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;

  const records = await find(
    "checkins",
    { phone, status: "confirmed", date: { $gte: startOfYear, $lte: endOfYear } },
    { sort: { date: -1 } },
  ) as unknown as Array<{ date: string; duration: number }>;

  const today = new Date().toISOString().split("T")[0];
  const todayHours = records
    .filter((r) => r.date === today)
    .reduce((sum, r) => sum + (r.duration || 0), 0);

  const yearTotal = records.reduce((sum, r) => sum + (r.duration || 0), 0);

  return NextResponse.json({
    today: todayHours,
    yearTotal,
    records,
  });
}
