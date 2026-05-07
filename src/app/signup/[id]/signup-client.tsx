"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SignupClientProps {
  user: { phone: string; username: string; role: string };
  recruitmentId: string;
  theme: { primary: string; bg: string; accent: string };
}

interface RecruitmentInfo {
  title: string;
  startDate: string;
  startTime: string;
  endTime: string;
  maxPerSlot: number;
}

interface TimeSlot {
  hour: number;
  label: string;
  remaining: number;
  disabled: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  social_volunteer: "社会志愿者",
  university_volunteer: "高校志愿者",
  youth_volunteer: "青少年志愿者",
};

export default function SignupClient({ user, recruitmentId, theme }: SignupClientProps) {
  const router = useRouter();
  const [recruitment, setRecruitment] = useState<RecruitmentInfo | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/signups/${recruitmentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.slots) {
          setRecruitment(data.recruitment);
          setSlots(data.slots);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [recruitmentId]);

  const toggleSlot = (index: number) => {
    setSelected((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        const next = [...prev, index].sort((a, b) => a - b);
        // Check if adding this slot breaks continuity
        for (let i = 1; i < next.length; i++) {
          if (next[i] !== next[i - 1] + 1) {
            alert("请选择连续的时间段，不可跳选");
            return prev;
          }
        }
        return next;
      }
    });
  };

  const handleSubmit = async () => {
    if (selected.length < 2 || selected.length > 6) {
      alert("请选择 2 到 6 个连续时间段");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId,
          selectedSlots: selected.map((i) => slots[i].hour.toString()),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/signup/${recruitmentId}/result?status=success`);
      } else {
        const reason = encodeURIComponent(data.message || "报名失败");
        router.push(`/signup/${recruitmentId}/result?status=failure&reason=${reason}`);
      }
    } catch {
      router.push(`/signup/${recruitmentId}/result?status=failure&reason=${encodeURIComponent("网络错误，请重试")}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">加载中...</div>;
  }

  if (!recruitment) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">未找到该活动</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 text-white rounded-xl text-sm"
          style={{ backgroundColor: theme.primary }}
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 顶部栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl" style={{ filter: "grayscale(1)" }}>🏛️</span>
          <span className="text-lg font-bold text-gray-800">{recruitment.title}</span>
        </div>
        <button
          onClick={() => router.back()}
          className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 active:scale-95 transition-transform"
        >
          返回
        </button>
      </div>

      {/* 只读信息 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 w-20 shrink-0">岗位类型</span>
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">
            {ROLE_LABELS[user.role] || user.role}
          </span>
          <span className="text-xs text-gray-400">系统默认，不可选</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 w-20 shrink-0">岗位日期</span>
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">
            {recruitment.startDate}
          </span>
          <span className="text-xs text-gray-400">系统默认，不可选</span>
        </div>
      </div>

      {/* 时间段选择 */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">预约服务时间段</h3>
        <div className="space-y-2">
          {slots.map((slot, index) => {
            const isSelected = selected.includes(index);
            const isDisabled = slot.disabled;

            return (
              <div
                key={index}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
                  isDisabled
                    ? "bg-gray-50 border-gray-100"
                    : isSelected
                    ? "bg-green-50 border-green-400"
                    : "bg-white border-gray-200"
                } ${!isDisabled ? "cursor-pointer active:scale-[0.99]" : "cursor-not-allowed opacity-60"}`}
                onClick={() => !isDisabled && toggleSlot(index)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                      isDisabled
                        ? "bg-gray-200 border-gray-300"
                        : isSelected
                        ? "border-transparent"
                        : "border-gray-400"
                    }`}
                    style={isSelected ? { backgroundColor: theme.primary } : {}}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isDisabled ? "text-gray-400" : "text-gray-700"}`}>
                    {slot.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    slot.remaining === 0
                      ? "bg-red-100 text-red-500"
                      : slot.remaining <= 2
                      ? "bg-orange-100 text-orange-500"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    余额 {slot.remaining}
                  </span>
                  {slot.remaining === 0 && (
                    <span className="text-xs text-red-400">已满</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 提示 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-700 leading-relaxed">
            💡 请选择 <strong>2-6个连续</strong>时间段，不可单选或跳选。余额为 0 的时段不可选。
          </p>
        </div>
      </div>

      {/* 底部按钮 */}
      <button
        onClick={handleSubmit}
        disabled={submitting || selected.length < 2 || selected.length > 6}
        className={`w-full h-12 rounded-xl text-base font-semibold transition-all ${
          submitting || selected.length < 2 || selected.length > 6
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "text-white active:scale-95 shadow-lg"
        }`}
        style={
          !(submitting || selected.length < 2 || selected.length > 6)
            ? { backgroundColor: theme.primary }
            : {}
        }
      >
        {submitting ? "提交中..." : `立刻报名（已选 ${selected.length} 个时段）`}
      </button>
    </div>
  );
}
