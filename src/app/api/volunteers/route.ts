export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/token";
import { Volunteers, findOne, insertMany } from "@/lib/mongo-ops";

// 获取志愿者列表
export async function GET(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const keyword = searchParams.get("keyword") || "";

  const filter: Record<string, unknown> = {};
  if (category) filter.volunteerType = category;
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { phone: { $regex: keyword } },
      { school: { $regex: keyword, $options: "i" } },
      { specialty: { $regex: keyword, $options: "i" } },
    ];
  }

  const items = await Volunteers.findAll(filter, { sort: { name: 1 } });
  return NextResponse.json({ items });
}

// 创建志愿者
export async function POST(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { phone, name, idCard, address, school, volunteerType, position, specialty, mustChangePassword } = await request.json();

  if (!phone || !name) {
    return NextResponse.json(
      { message: "请填写手机号和姓名" },
      { status: 400 },
    );
  }

  // 检查是否已存在
  const existing = await Volunteers.findByPhone(phone);
  if (existing) {
    return NextResponse.json(
      { message: "该手机号已存在" },
      { status: 400 },
    );
  }

  // 从身份证号提取性别和生日
  let gender = "";
  let birthday = "";
  if (idCard && idCard.length === 18) {
    const year = parseInt(idCard.substring(6, 10), 10);
    const month = parseInt(idCard.substring(10, 12), 10);
    const day = parseInt(idCard.substring(12, 14), 10);
    gender = parseInt(idCard[16], 10) % 2 === 1 ? "男" : "女";
    birthday = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  await Volunteers.create({
    phone,
    name,
    idCard: idCard || "",
    gender,
    birthday,
    address: address || "",
    school: school || "",
    volunteerType: volunteerType || "social_volunteer",
    position: position || "",
    specialty: specialty || "",
  });

  // 同时创建用户账号（如果不存在）
  const userExists = await findOne("users", { phone });
  if (!userExists) {
    const { hashPassword } = await import("@/lib/crypto");
    const defaultPassword = process.env.DEFAULT_PASSWORD || "123456";
    const hash = await hashPassword(defaultPassword);
    const { Users } = await import("@/lib/mongo-ops");
    await Users.create({
      phone,
      password: hash,
      role: volunteerType || "social_volunteer",
      username: name,
      mustChangePassword: mustChangePassword !== false,
    });
  }

  return NextResponse.json({ message: "添加成功" }, { status: 201 });
}

// 批量导入
export async function PATCH(request: NextRequest) {
  const token = verifyToken(request);
  if (!token) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { volunteers } = await request.json();
  if (!Array.isArray(volunteers) || volunteers.length === 0) {
    return NextResponse.json(
      { message: "数据为空" },
      { status: 400 },
    );
  }

  // 过滤已存在的
  const existingPhones = new Set<string>();
  for (const v of volunteers) {
    const existing = await Volunteers.findByPhone(v.phone);
    if (existing) existingPhones.add(v.phone);
  }

  const newVolunteers = volunteers.filter((v) => !existingPhones.has(v.phone));

  if (newVolunteers.length === 0) {
    return NextResponse.json({ message: "所有记录已存在" }, { status: 200 });
  }

  await insertMany("volunteers", newVolunteers.map((v) => ({
    ...v,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })));

  return NextResponse.json({
    message: `成功导入 ${newVolunteers.length} 条，跳过 ${existingPhones.size} 条`,
  });
}
