export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { Volunteers, findOne } from "@/lib/mongo-ops";

// 自动生成 UID: ZY-00001
async function generateUID(): Promise<string> {
  const allVolunteers = await Volunteers.findAll({});
  const maxNum = allVolunteers.reduce((max: number, v: any) => {
    const uid = v.uid || "";
    const match = uid.match(/^ZY-(\d+)$/);
    const num = match ? parseInt(match[1]) : 0;
    return num > max ? num : max;
  }, 0);
  return `ZY-${String(maxNum + 1).padStart(5, "0")}`;
}

// 获取志愿者列表
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (phone) {
    const volunteer = await Volunteers.findByPhone(phone);
    return NextResponse.json(volunteer || {});
  }

  const volunteers = await Volunteers.findAll({});
  return NextResponse.json({ volunteers });
}

// 创建志愿者
export async function POST(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const uid = await generateUID();

  const id = await Volunteers.create({
    ...body,
    phone: body.phone || token.phone,
    uid,
  });

  return NextResponse.json({ message: "创建成功", id, uid }, { status: 201 });
}
