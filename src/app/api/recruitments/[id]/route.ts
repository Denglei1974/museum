export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { Recruitments } from "@/lib/mongo-ops";

export async function PATCH(request: NextRequest) {
  const token = verifyToken(request);
  if (!token || token.role !== "publish_admin") {
    return NextResponse.json({ message: "无权限" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "缺少ID" }, { status: 400 });
  }

  const { status } = await request.json();
  if (!["active", "inactive"].includes(status)) {
    return NextResponse.json({ message: "无效状态" }, { status: 400 });
  }

  await Recruitments.update(id, { status });
  return NextResponse.json({ message: "更新成功" });
}
