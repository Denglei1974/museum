export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { findOne } from "@/lib/mongo-ops";

// 获取当前志愿者个人信息
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const volunteer = await findOne("volunteers", { phone: token.phone });
  if (!volunteer) {
    return NextResponse.json({ message: "未找到志愿者档案" }, { status: 404 });
  }

  // 志愿者看自己的，完整显示身份证号
  return NextResponse.json({
    name: volunteer.name || "",
    uid: volunteer.uid || "",
    idCard: volunteer.idCard || "",
    phone: volunteer.phone || "",
    createdAt: volunteer.createdAt || "",
    volunteerType: volunteer.volunteerType || "",
    school: volunteer.school || "",
    specialty: volunteer.specialty || "",
    gender: volunteer.gender || "",
    birthday: volunteer.birthday || "",
  });
}
