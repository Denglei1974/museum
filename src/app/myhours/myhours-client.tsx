"use client";

import { useState, useEffect } from "react";

interface MyHoursClientProps {
  phone: string;
  username: string;
  theme: { primary: string; bg: string; accent: string };
}

export default function MyHoursClient({ phone, username, theme }: MyHoursClientProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [honorCount, setHonorCount] = useState(0);
  const [honorHours, setHonorHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/honor-hours?phone=${encodeURIComponent(phone)}&year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setHonorCount(data.count || 0);
          setHonorHours(data.hours || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [phone, year]);

  const years = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }

  return (
    <div>
      {/* 顶部欢迎区 */}
      <div className="px-5 pt-8 pb-6 rounded-b-3xl" style={{ backgroundColor: theme.primary }}>
        <p className="text-sm text-white/80">博物馆志愿者系统，感谢您的付出</p>
        <h1 className="text-2xl font-bold text-white mt-1">欢迎回来，{username}！</h1>
      </div>

      {/* 主要内容 */}
      <div className="px-4 pt-4 pb-4">
        {/* 荣誉时长标题条 */}
        <div className="mb-5 rounded-xl p-4 text-center text-white font-bold text-lg shadow-md" style={{ backgroundColor: theme.accent || "#E67E22" }}>
          荣誉时长
        </div>

        {/* 年度选择器 */}
        <div className="flex items-center justify-between mb-5 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">年度：</span>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500">可年度查询</span>
        </div>

        {/* 统计数据卡片 */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 text-sm">
            加载中...
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">荣誉次数</p>
                <p className="text-4xl font-bold" style={{ color: theme.primary }}>{honorCount}</p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-1">荣誉时长</p>
                <p className="text-4xl font-bold" style={{ color: theme.primary }}>{honorHours}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
