"use client";

import { useState, useEffect } from "react";
import VolunteerNav from "@/components/nav/volunteer-nav";

interface ProfileClientProps {
  user: { phone: string; username: string; role: string };
  roleLabel: string;
  theme: { primary: string; bg: string; accent: string };
}

interface VolunteerInfo {
  name: string;
  uid: string;
  idCard: string;
  phone: string;
  gender: string;
  birthday: string;
  volunteerType: string;
  school: string;
  specialty: string;
  address: string;
}

interface TodayAssignment {
  timeSlots: { start: string; end: string; position?: string }[];
}

const ROLE_LABELS: Record<string, string> = {
  social_volunteer: "社会志愿者",
  university_volunteer: "高校志愿者",
  youth_volunteer: "青少年志愿者",
};

export default function ProfileClient({ user, roleLabel, theme }: ProfileClientProps) {
  const [volunteer, setVolunteer] = useState<VolunteerInfo | null>(null);
  const [todayAssignment, setTodayAssignment] = useState<TodayAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/volunteers/me`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.message) {
          setVolunteer(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 获取今日岗位（从 signups + recruitments 关联查询）
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/profile/today-assignment?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.slots) {
          setTodayAssignment({ timeSlots: data.slots });
        }
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-2xl mb-2">⏳</div>
        <p>加载中...</p>
      </div>
    );
  }

  const displayName = volunteer?.name || user.username;
  const displayRole = ROLE_LABELS[user.role] || roleLabel || user.role;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* 个人信息卡片 */}
      <div className="px-5 pt-6 pb-8 rounded-b-3xl shadow-sm" style={{ backgroundColor: theme.primary + "18" }}>
        <div className="flex items-center gap-4">
          {/* 头像 */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.primary }}>
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          {/* 信息 */}
          <div>
            <p className="text-lg font-bold text-gray-800">{displayName}</p>
            <p className="text-sm text-gray-500 mt-1">{displayRole}</p>
          </div>
        </div>
      </div>

      {/* 今日岗位 */}
      <div className="px-4 -mt-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-3">今日岗位</h3>
          {todayAssignment && todayAssignment.timeSlots.length > 0 ? (
            <div className="space-y-2">
              {todayAssignment.timeSlots.map((slot, i) => (
                <p key={i} className="text-sm text-gray-600">
                  {slot.start} - {slot.end}{slot.position ? `  ${slot.position}` : ""}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">今日暂无排班</p>
          )}
        </div>
      </div>

      {/* 三个功能按钮 */}
      <div className="px-4 space-y-3 mb-6">
        <a href="/profile/info" className="block">
          <div
            className="rounded-xl p-4 text-center text-white font-semibold text-base shadow-md active:scale-[0.98] transition-transform"
            style={{ backgroundColor: "#3B82F6" }}
          >
            个人信息
          </div>
        </a>

        <a href="/profile/activities" className="block">
          <div
            className="rounded-xl p-4 text-center text-white font-semibold text-base shadow-md active:scale-[0.98] transition-transform"
            style={{ backgroundColor: "#10B981" }}
          >
            参与活动
          </div>
        </a>

        <a href="/myhours" className="block">
          <div
            className="rounded-xl p-4 text-center text-white font-semibold text-base shadow-md active:scale-[0.98] transition-transform"
            style={{ backgroundColor: "#F59E0B" }}
          >
            荣誉时长
          </div>
        </a>
      </div>

      {/* 底部导航栏 */}
      <VolunteerNav theme={theme} active="profile" />
    </div>
  );
}
