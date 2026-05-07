"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardProps {
  user: { phone: string; username: string; role: string };
  role: string;
  theme: { primary: string; bg: string; accent: string };
  isVolunteer: boolean;
  isAdmin: boolean;
}

interface HoursData {
  today: number;
  yearTotal: number;
}

export default function DashboardClient({
  user,
  role,
  theme,
  isVolunteer,
  isAdmin,
}: DashboardProps) {
  const [hours, setHours] = useState<HoursData>({ today: 0, yearTotal: 0 });

  useEffect(() => {
    if (isVolunteer) {
      fetch(`/api/my-hours?phone=${encodeURIComponent(user.phone)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.today !== undefined) {
            setHours({ today: data.today, yearTotal: data.yearTotal });
          }
        })
        .catch(() => {});
    }
  }, [isVolunteer, user.phone]);

  // 志愿者主页
  if (isVolunteer) {
    return (
      <div>
        {/* 时长统计卡片 */}
        <div
          className="rounded-2xl p-6 mb-6 text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
          }}
        >
          <p className="text-sm opacity-90 mb-1">今日服务时长</p>
          <p className="text-3xl font-bold mb-3">{hours.today.toFixed(1)} 小时</p>
          <div className="flex justify-between text-sm opacity-90 border-t border-white/30 pt-3">
            <span>本年度累计</span>
            <span className="font-semibold">{hours.yearTotal.toFixed(1)} 小时</span>
          </div>
        </div>

        {/* 功能入口 */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/recruit" className="block">
            <div className="bg-white rounded-2xl p-5 shadow-md text-center active:scale-95 transition-transform">
              <span className="text-3xl">📋</span>
              <p className="mt-2 text-base font-semibold text-gray-700">查看招募</p>
              <p className="text-xs text-gray-400 mt-1">报名参与活动</p>
            </div>
          </Link>

          <Link href="/checkin" className="block">
            <div className="bg-white rounded-2xl p-5 shadow-md text-center active:scale-95 transition-transform">
              <span className="text-3xl">✅</span>
              <p className="mt-2 text-base font-semibold text-gray-700">签到签退</p>
              <p className="text-xs text-gray-400 mt-1">记录服务时间</p>
            </div>
          </Link>

          <Link href="/myhours" className="block">
            <div className="bg-white rounded-2xl p-5 shadow-md text-center active:scale-95 transition-transform">
              <span className="text-3xl">⏱️</span>
              <p className="mt-2 text-base font-semibold text-gray-700">我的时长</p>
              <p className="text-xs text-gray-400 mt-1">查看历史记录</p>
            </div>
          </Link>

          <Link href="/profile" className="block">
            <div className="bg-white rounded-2xl p-5 shadow-md text-center active:scale-95 transition-transform">
              <span className="text-3xl">👤</span>
              <p className="mt-2 text-base font-semibold text-gray-700">个人中心</p>
              <p className="text-xs text-gray-400 mt-1">信息与活动</p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // 管理员主页
  return (
    <div>
      {/* 管理面板 */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">管理功能</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/volunteers" className="block">
            <div className="bg-gray-50 rounded-xl p-4 text-center active:scale-95 transition-transform border border-gray-100">
              <span className="text-2xl">👥</span>
              <p className="mt-1 text-sm font-semibold text-gray-700">志愿者管理</p>
            </div>
          </Link>

          <Link href="/admin/recruitments" className="block">
            <div className="bg-gray-50 rounded-xl p-4 text-center active:scale-95 transition-transform border border-gray-100">
              <span className="text-2xl">📢</span>
              <p className="mt-1 text-sm font-semibold text-gray-700">招募管理</p>
            </div>
          </Link>

          <Link href="/admin/checkins" className="block">
            <div className="bg-gray-50 rounded-xl p-4 text-center active:scale-95 transition-transform border border-gray-100">
              <span className="text-2xl">📊</span>
              <p className="mt-1 text-sm font-semibold text-gray-700">签到管理</p>
            </div>
          </Link>

          <Link href="/admin/reports" className="block">
            <div className="bg-gray-50 rounded-xl p-4 text-center active:scale-95 transition-transform border border-gray-100">
              <span className="text-2xl">📈</span>
              <p className="mt-1 text-sm font-semibold text-gray-700">数据报表</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 审批入口（仅审核管理员和发布管理员） */}
      {role === "review_admin" || role === "publish_admin" ? (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">待办审批</h2>
          <Link href="/admin/approvals" className="block">
            <div className="bg-yellow-50 rounded-xl p-4 text-center active:scale-95 transition-transform border border-yellow-200">
              <span className="text-2xl">📝</span>
              <p className="mt-1 text-sm font-semibold text-yellow-700">审批中心</p>
            </div>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
