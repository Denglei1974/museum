"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@heroui/react";

interface UserInfo {
  username: string;
  user_type: string;
  phone: string;
}

function decodeUser(): UserInfo | null {
  try {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("auth-token="));
    if (!cookie) return null;
    const token = cookie.split("=")[1];
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    setUser(decodeUser());
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/signin";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部 Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {user?.username?.charAt(0) || "V"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.username || "志愿者"}</h1>
            <span className="inline-block bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mt-1">
              {user?.user_type || "普通志愿者"}
            </span>
          </div>
        </div>
      </div>

      {/* 功能卡片 */}
      <div className="px-4 mt-6 space-y-3">
        {/* 活动报名 */}
        <Card className="shadow-sm border-none">
          <div className="flex flex-row items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl shrink-0">
              📋
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">活动报名</p>
              <p className="text-sm text-gray-500">查看并报名志愿活动</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => {
                window.location.href = "/volunteerSignup";
              }}
            >
              前往
            </Button>
          </div>
        </Card>

        {/* 我的排班 */}
        <Card className="shadow-sm border-none">
          <div className="flex flex-row items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl shrink-0">
              ⏰
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">我的排班</p>
              <p className="text-sm text-gray-500">查看值班时间安排</p>
            </div>
            <Button size="sm" variant="outline" isDisabled>
              开发中
            </Button>
          </div>
        </Card>

        {/* 服务时长 */}
        <Card className="shadow-sm border-none">
          <div className="flex flex-row items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl shrink-0">
              ⭐
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">服务时长</p>
              <p className="text-sm text-gray-500">累计志愿服务时间</p>
            </div>
            <Button size="sm" variant="outline" isDisabled>
              开发中
            </Button>
          </div>
        </Card>
      </div>

      {/* 退出登录 */}
      <div className="px-4 mt-8">
        <div className="h-px bg-gray-200 mb-4" />
        <Button
          fullWidth
          variant="danger-soft"
          onPress={handleLogout}
          className="text-sm"
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}
