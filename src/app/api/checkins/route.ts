export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { Checkins, findOne, find } from "@/lib/mongo-ops";

// 获取签到记录
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") || token.phone;
  const dateFilter = searchParams.get("date");

  // 管理员查指定日期
  if (dateFilter && (token.role?.includes("admin") || token.role?.includes("leader"))) {
    const allRecords = await find("checkins", { date: dateFilter }, { sort: { checkinTime: 1 } });
    return NextResponse.json({ records: allRecords });
  }

  // 志愿者只能查自己的
  if (!token.role?.includes("admin") && phone !== token.phone) {
    return NextResponse.json({ message: "无权限" }, { status: 403 });
  }

  const records = await Checkins.findByPhone(phone, {
    sort: { date: -1 },
    limit: 100,
  });

  return NextResponse.json({ records });
}

// 签到/签退
export async function POST(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { action, recruitmentId } = await request.json();

  if (!action || !["checkin", "checkout"].includes(action)) {
    return NextResponse.json(
      { message: "无效操作" },
      { status: 400 },
    );
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeStr = now.toISOString().split("T")[1]?.substring(0, 5) || "";

  // 查找今天的签到记录
  let record = await findOne("checkins", { phone: token.phone, date: today });

  if (action === "checkin") {
    if (record) {
      return NextResponse.json(
        { message: "今天已签到，请直接签退" },
        { status: 400 },
      );
    }

    const id = await Checkins.create({
      phone: token.phone,
      username: token.username,
      recruitmentId: recruitmentId || "",
      date: today,
      checkinTime: timeStr,
      checkoutTime: "",
      duration: 0,
      status: "active",
      createdBy: token.phone,
    });

    return NextResponse.json({ message: "签到成功", id });
  }

  // 签退
  if (!record) {
    return NextResponse.json(
      { message: "今天还没有签到记录" },
      { status: 400 },
    );
  }

  const recordObj = record as Record<string, unknown>;
  const checkinTime = recordObj.checkinTime as string;

  // 计算时长（小时）
  const [checkinH, checkinM] = checkinTime.split(":").map(Number);
  const [checkoutH, checkoutM] = timeStr.split(":").map(Number);
  let duration = (checkoutH + checkoutM / 60) - (checkinH + checkinM / 60);
  if (duration < 0) duration += 24; // 跨天
  duration = Math.round(duration * 10) / 10;

  const recordId = String((recordObj as any)._id);
  await Checkins.update(recordId, {
    checkoutTime: timeStr,
    duration,
    status: "confirmed",
  });

  return NextResponse.json({
    message: "签退成功",
    duration,
  });
}
