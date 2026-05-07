"use client";

import VolunteerNav from "@/components/nav/volunteer-nav";

interface ResultClientProps {
  recruitmentId: string;
  status: "success" | "failure";
  reason: string;
  theme: { primary: string; bg: string; accent: string };
}

export default function ResultClient({ status, reason, theme }: ResultClientProps) {
  const isSuccess = status === "success";

  return (
    <div>
      {/* 气球图标 */}
      <div className="flex justify-center mb-6">
        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
          {/* 气球 1 */}
          <ellipse cx="35" cy="30" rx="18" ry="22" fill={isSuccess ? "#2E7D32" : "#9E9E9E"} opacity="0.9" />
          <ellipse cx="35" cy="30" rx="6" ry="10" fill="white" opacity="0.2" transform="rotate(-20 35 30)" />
          <path d="M35 52 Q33 60 30 70" stroke={isSuccess ? "#2E7D32" : "#9E9E9E"} strokeWidth="1.5" />
          {/* 气球 2 */}
          <ellipse cx="55" cy="25" rx="20" ry="25" fill={isSuccess ? "#388E3C" : "#757575"} />
          <ellipse cx="55" cy="25" rx="7" ry="11" fill="white" opacity="0.2" transform="rotate(-15 55 25)" />
          <path d="M55 50 Q57 58 60 70" stroke={isSuccess ? "#388E3C" : "#757575"} strokeWidth="1.5" />
          {/* 气球 3 */}
          <ellipse cx="75" cy="35" rx="16" ry="20" fill={isSuccess ? "#43A047" : "#9E9E9E"} opacity="0.85" />
          <ellipse cx="75" cy="35" rx="5" ry="9" fill="white" opacity="0.2" transform="rotate(-10 75 35)" />
          <path d="M75 55 Q74 62 70 70" stroke={isSuccess ? "#43A047" : "#9E9E9E"} strokeWidth="1.5" />
          {/* 绳子 */}
          <path d="M30 70 Q45 78 55 75 Q65 72 70 70" stroke={isSuccess ? "#2E7D32" : "#9E9E9E"} strokeWidth="1" />
        </svg>
      </div>

      {/* 标题 */}
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        感谢您的付出
      </h1>

      {/* 状态标签 */}
      <div className="flex justify-center mb-8">
        <span
          className="px-8 py-3 rounded-xl text-base font-semibold text-white shadow-md"
          style={{
            backgroundColor: isSuccess ? theme.primary : "#9E9E9E",
          }}
        >
          {isSuccess ? "报名成功" : "报名失败"}
        </span>
      </div>

      {/* 说明文字 */}
      {isSuccess ? (
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            岗位将由系统在今日 20:00 自动分配
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            您可在个人中心查看当日岗位
          </p>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              如需取消报名，请联系管理员
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            {reason || "您选择的服务时段已被占用"}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            请重新选择时段，或联系管理员
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl active:scale-95 transition-transform shadow-md"
              style={{ backgroundColor: theme.primary }}
            >
              重新选择
            </button>
          </div>
        </div>
      )}

      {/* 底部导航栏 */}
      <VolunteerNav theme={theme} />
    </div>
  );
}
