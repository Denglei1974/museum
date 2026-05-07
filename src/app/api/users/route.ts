export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { Users, Volunteers, findOne } from "@/lib/mongo-ops";

// 自动生成 UID: ZY-00001
async function generateUID(): Promise<string> {
  const allVolunteers = await Volunteers.findAll({});
  const maxNum = allVolunteers.reduce((max: number, v: any) => {
    const num = parseInt((v.uid || "0").replace("ZY-", ""));
    return num > max ? num : max;
  }, 0);
  return `ZY-${String(maxNum + 1).padStart(5, "0")}`;
}

/**
 * 用户注册 API（管理后台使用）
 */
export async function POST(request: NextRequest) {
  const { username, phone, password, role, mustChangePassword, volunteerInfo } =
    await request.json();

  if (!phone || !password) {
    return NextResponse.json(
      { message: "请填写手机号和密码" },
      { status: 400 },
    );
  }

  try {
    // 检查是否已存在
    const existing = await Users.findByPhone(phone);
    if (existing) {
      return NextResponse.json(
        { message: "该手机号已被注册" },
        { status: 400 },
      );
    }

    const { hashPassword } = await import("@/lib/crypto");
    const hashedPassword = await hashPassword(password);

    // 生成 UID
    const uid = await generateUID();

    await Users.create({
      username: username || phone,
      phone,
      password: hashedPassword,
      role: role || "social_volunteer",
      mustChangePassword: mustChangePassword !== false,
    });

    // 如果有志愿者信息，创建志愿者记录
    if (volunteerInfo) {
      await Volunteers.create({
        phone,
        uid,
        name: volunteerInfo.name || "",
        idCard: volunteerInfo.idCard || "",
        volunteerType: volunteerInfo.volunteerType || role || "social_volunteer",
        school: volunteerInfo.school || "",
        specialty: volunteerInfo.specialty || "",
        address: volunteerInfo.address || "",
        other: volunteerInfo.other || "",
      });
    }

    return NextResponse.json(
      { message: "用户创建成功", uid },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json(
      { message: "创建失败，请稍后重试" },
      { status: 500 },
    );
  }
}

// 获取用户列表（管理员用）
export async function GET(request: NextRequest) {
  const users = await Users.findAll({});
  return NextResponse.json({ users });
}
