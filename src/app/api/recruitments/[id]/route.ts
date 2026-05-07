export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { Recruitments, ObjectId } from "@/lib/mongo-ops";

// 获取单个招募详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const item = await Recruitments.findById(id);

  if (!item) {
    return NextResponse.json({ message: "未找到该活动" }, { status: 404 });
  }

  return NextResponse.json(item);
}
