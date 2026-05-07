"use client";

import { useState, useEffect } from "react";
import VolunteerNav from "@/components/nav/volunteer-nav";

interface ActivitiesClientProps {
  user: { phone: string; username: string; role: string };
  theme: { primary: string; bg: string; accent: string };
}

interface Activity {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  location: string;
  description: string;
}

export default function ActivitiesClient({ user, theme }: ActivitiesClientProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Activity | null>(null);

  useEffect(() => {
    fetch(`/api/my-activities?phone=${encodeURIComponent(user.phone)}`)
      .then((r) => r.json())
      .then((data) => {
        setActivities(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.phone]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  // 详情页
  if (selected) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f7e8" }}>
        {/* 顶部标题 */}
        <div className="px-4 py-3 text-white" style={{ backgroundColor: theme.primary }}>
          <p className="text-sm text-white/80">欢迎回来，{user.username}！</p>
          <p className="text-xs text-white/60 mt-0.5">博物馆志愿者系统，感谢您的付出</p>
        </div>

        {/* 绿色标题条 */}
        <div className="px-4 py-3 text-white text-center font-semibold" style={{ backgroundColor: theme.primary }}>
          参与活动
        </div>

        {/* 活动详情 */}
        <div className="flex-1 px-4 pt-4 pb-20">
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-800 mb-4">{selected.name}</p>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">活动时间：</span>
                <span className="text-gray-700">{selected.date}</span>
              </div>
              <div>
                <span className="text-gray-500">活动时长：</span>
                <span className="text-gray-700">{selected.duration} 小时</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setSelected(null)}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg active:scale-95 transition-transform"
              style={{ backgroundColor: theme.primary }}
            >
              返回列表
            </button>
          </div>
        </div>

        {/* 底部导航栏 */}
        <VolunteerNav theme={theme} active="profile" />
      </div>
    );
  }

  // 列表页
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f7e8" }}>
      {/* 顶部标题 */}
      <div className="px-4 py-3 text-white" style={{ backgroundColor: theme.primary }}>
        <p className="text-sm text-white/80">欢迎回来，{user.username}！</p>
        <p className="text-xs text-white/60 mt-0.5">博物馆志愿者系统，感谢您的付出</p>
      </div>

      {/* 绿色标题条 */}
      <div className="px-4 py-3 text-white text-center font-semibold" style={{ backgroundColor: theme.primary }}>
        参与活动
      </div>

      {/* 活动列表 */}
      <div className="flex-1 px-4 pt-2 pb-20">
        {activities.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            <p className="text-lg mb-1">暂无活动记录</p>
            <p className="text-sm">报名参与活动后，这里会显示您的参与记录</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden">
            {activities.map((a, i) => (
              <div
                key={a.id}
                className={`flex items-center px-4 py-3.5 ${
                  i < activities.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.startTime} - {a.endTime}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(a)}
                  className="px-3 py-1.5 text-xs font-semibold text-white rounded ml-3 shrink-0 active:scale-95 transition-transform"
                  style={{ backgroundColor: "#3B82F6" }}
                >
                  查看详情
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部导航栏 */}
      <VolunteerNav theme={theme} active="profile" />
    </div>
  );
}
