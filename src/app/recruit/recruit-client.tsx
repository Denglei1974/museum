"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RecruitClientProps {
  user: { phone: string; username: string; role: string };
  isVolunteer: boolean;
  theme: { primary: string; bg: string; accent: string };
}

interface Recruitment {
  _id?: string;
  title: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxPeople: number;
  positions: string[];
  location: string;
  status: string;
}

export default function RecruitClient({ user, isVolunteer, theme }: RecruitClientProps) {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recruitments?status=active")
      .then((r) => r.json())
      .then((data) => {
        setRecruitments(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">加载中...</div>
    );
  }

  if (recruitments.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl">📭</span>
        <p className="text-gray-500 mt-4 text-lg">暂无招募活动</p>
        <p className="text-gray-400 text-sm mt-1">请等待管理员发布新活动</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recruitments.map((item) => {
        const typeLabel = item.type === "daily" ? "日常服务" : "特殊活动";

        return (
          <div
            key={String(item._id)}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            {/* 类型标签 */}
            <div
              className="px-4 py-2 text-white text-sm font-semibold"
              style={{ backgroundColor: item.type === "daily" ? theme.primary : "#E65100" }}
            >
              {typeLabel}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>

              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>📅 {item.startDate}{item.endDate !== item.startDate ? ` ~ ${item.endDate}` : ""}</p>
                {item.startTime && <p> {item.startTime} - {item.endTime}</p>}
                {item.location && <p>📍 {item.location}</p>}
                {item.positions && item.positions.length > 0 && (
                  <p>🏷️ 岗位：{item.positions.join("、")}</p>
                )}
                {item.maxPeople > 0 && <p>👥 招募人数：{item.maxPeople}人</p>}
              </div>

              {isVolunteer && (
                <Link
                  href={`/signup/${item._id}`}
                  className="block w-full h-11 bg-gradient-to-r rounded-xl text-center leading-11 text-base font-semibold text-white active:scale-95 transition-all"
                  style={{ backgroundColor: theme.primary }}
                >
                  立刻报名
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
