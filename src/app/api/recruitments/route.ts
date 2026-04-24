export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { Recruitments } from "@/lib/mongo-ops";

// 获取招募列表
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "active";

  const filter: Record<string, unknown> = {};
  if (status === "active") {
    filter.status = "active";
  }
  // status="all" 不过滤, status="inactive" 查已结束

  const items = await Recruitments.findAll(filter, {
    sort: { startDate: 1 },
  });

  return NextResponse.json({ items });
}

// 创建招募（发布管理员）
export async function POST(request: NextRequest) {
  const token = verifyToken(request);
  if (!token || token.role !== "publish_admin") {
    return NextResponse.json({ message: "无权限" }, { status: 403 });
  }

  const body = await request.json();
  const {
    title,
    type,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    maxPeople,
    positions,
    location,
    targetRole,
  } = body;

  if (!title || !startDate) {
    return NextResponse.json(
      { message: "请填写标题和开始日期" },
      { status: 400 },
    );
  }

  const id = await Recruitments.create({
    title,
    type: type || "daily",
    description: description || "",
    startDate,
    endDate: endDate || startDate,
    startTime: startTime || "",
    endTime: endTime || "",
    maxPeople: maxPeople || 0,
    positions: positions || ["通用"],
    location: location || "",
    targetRole: targetRole || "",
    status: "active",
    createdBy: token.phone,
  });

  return NextResponse.json({ message: "创建成功", id }, { status: 201 });
}
