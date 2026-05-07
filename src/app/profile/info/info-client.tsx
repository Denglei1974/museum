"use client";

import { useState, useEffect } from "react";
import VolunteerNav from "@/components/nav/volunteer-nav";

interface InfoClientProps {
  user: { phone: string; username: string; role: string };
  theme: { primary: string; bg: string; accent: string };
}

const VOLUNTEER_TYPE_MAP: Record<string, string> = {
  social_volunteer: "社会志愿者",
  college_volunteer: "大学生志愿者",
  youth_volunteer: "青少年志愿者",
};

export default function InfoClient({ user, theme }: InfoClientProps) {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/volunteers/me")
      .then((r) => r.json())
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  const typeLabel = VOLUNTEER_TYPE_MAP[info?.volunteerType || ""] || info?.volunteerType || user.role;

  const formatDate = (iso: string) => {
    if (!iso) return "未录入";
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const fields = [
    { label: "姓名", value: info?.name || "未录入", required: true },
    { label: "UID", value: info?.uid || "未录入", required: true },
    { label: "身份证号", value: info?.idCard || "未录入", required: true },
    { label: "手机号", value: info?.phone || user.phone, required: true },
    { label: "注册日期", value: formatDate(info?.createdAt), required: false },
    { label: "所属类别", value: typeLabel, required: false },
    { label: "所属单位", value: info?.school || "未录入", required: false },
    { label: "特殊组别", value: info?.specialty || "未录入", required: false },
    { label: "其他", value: info?.other || "无", required: false },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bg }}>
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-center px-4 py-3 text-white" style={{ backgroundColor: theme.primary }}>
        <h1 className="text-base font-bold">个人信息</h1>
      </div>

      {/* 信息列表 */}
      <div className="flex-1 px-4 pt-4 pb-20">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {fields.map((f, i) => (
            <div
              key={i}
              className={`flex justify-between items-center px-4 py-3.5 ${
                i < fields.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="text-sm text-gray-500">
                {f.required && <span className="text-red-400 mr-1">*</span>}
                {f.label}
              </span>
              <span className="text-sm font-medium text-gray-800 max-w-[60%] text-right truncate">
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-gray-400 mt-6 px-4">
          个人信息由管理员录入，如需修改请联系管理员
        </p>
      </div>

      {/* 底部导航栏 */}
      <VolunteerNav theme={theme} active="profile" />
    </div>
  );
}
