export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { Approvals, findOne, updateOne, ObjectId } from "@/lib/mongo-ops";

// 获取审批列表
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  // 只有审核管理员和发布管理员可以查看
  if (token.role !== "review_admin" && token.role !== "publish_admin") {
    return NextResponse.json({ message: "无权限" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const filter: Record<string, unknown> = {};
  if (status !== "all") {
    filter.status = status;
  }

  const items = await Approvals.findAll(filter, {
    sort: { createdAt: -1 },
  });

  return NextResponse.json({ items });
}

// 创建审批请求
export async function POST(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { type, description, details } = await request.json();

  if (!type || !description) {
    return NextResponse.json(
      { message: "请填写完整" },
      { status: 400 },
    );
  }

  const id = await Approvals.create({
    type, // checkin_fix, info_change, recruitment_change
    description,
    details: details || {},
    requestedBy: token.phone,
    requestedByName: token.username,
    status: "pending",
  });

  return NextResponse.json({ message: "已提交审批", id }, { status: 201 });
}

// 审批操作
export async function PATCH(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  if (token.role !== "review_admin") {
    return NextResponse.json({ message: "无权限" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "缺少审批ID" },
      { status: 400 },
    );
  }

  const { action, comment } = await request.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { message: "无效操作" },
      { status: 400 },
    );
  }

  const approval = await Approvals.findById(id);
  if (!approval) {
    return NextResponse.json(
      { message: "审批记录不存在" },
      { status: 404 },
    );
  }

  const approvalObj = approval as Record<string, unknown>;
  const details = (approvalObj.details as Record<string, unknown>) || {};

  await Approvals.update(id, {
    status: action === "approve" ? "approved" : "rejected",
    reviewedBy: token.phone,
    reviewedByName: token.username,
    reviewComment: comment || "",
    reviewedAt: new Date().toISOString(),
  });

  // 如果是补录签到且审批通过，更新签到记录
  if (action === "approve" && approvalObj.type === "checkin_fix" && details.checkinId) {
    await updateOne("checkins", { _id: details.checkinId }, {
      $set: { status: "confirmed", approvedBy: token.phone },
    });
  }

  return NextResponse.json({ message: action === "approve" ? "已批准" : "已驳回" });
}
