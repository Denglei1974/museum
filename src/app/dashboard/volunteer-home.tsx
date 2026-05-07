"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VolunteerNav from "@/components/nav/volunteer-nav";

interface VolunteerHomeProps {
  user: { phone: string; username: string; role: string };
  role: string;
  roleLabel: string;
  theme: { primary: string; bg: string; accent: string };
}

interface Recruitment {
  _id: string;
  title: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
}

export default function VolunteerHome({ user, theme }: VolunteerHomeProps) {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recruitments?status=active")
      .then((r) => r.json())
      .then((data) => {
        setRecruitments(data.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const activeRecruitment = recruitments.length > 0 ? recruitments[0] : null;

  const today = new Date();
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 ${weekDays[today.getDay()]}`;

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto relative" style={{ backgroundColor: "#f5f6f8" }}>
      {/* 顶部欢迎区域 */}
      <div
        className="px-5 pt-10 pb-10"
        style={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
        }}
      >
        <p className="text-sm text-white/80">{dateStr}</p>
        <h1 className="text-2xl font-bold text-white mt-1">{user.username}，你好 👋</h1>
        <p className="text-sm text-white/70 mt-2">欢迎回来，今天也要加油哦</p>
      </div>

      {/* 主要内容区 */}
      <div className="flex-1 px-4 pb-24">
        {/* 博物馆图片 */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "16/9" }}>
          <img
            src="/images/museum.svg"
            alt="张学良旧居"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 正在招募 */}
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full" style={{ backgroundColor: theme.primary }}></span>
          正在招募
        </h2>

        {/* 招募卡片 */}
        {loading ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">加载中...</div>
        ) : activeRecruitment ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              {activeRecruitment.title}
            </h3>
            <div className="space-y-1.5 text-sm text-gray-600">
              <p>
                📅 {formatDate(activeRecruitment.startDate)}
                {activeRecruitment.startTime ? ` ${activeRecruitment.startTime}` : ""}
                {activeRecruitment.endTime ? ` - ${activeRecruitment.endTime}` : ""}
              </p>
              {activeRecruitment.location && (
                <p>📍 {activeRecruitment.location}</p>
              )}
            </div>
            {/* 立刻报名按钮 */}
            <div className="mt-4 flex justify-end">
              <Link
                href={`/signup/${activeRecruitment._id}`}
                className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl active:scale-95 transition-transform shadow-md"
                style={{ backgroundColor: theme.primary }}
              >
                立刻报名 →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">
            暂无正在招募的活动
          </div>
        )}
      </div>

      {/* 底部导航栏 */}
      <VolunteerNav theme={theme} active="home" />
    </div>
  );
}
