"use client";

import { useState, useEffect, useCallback } from "react";

interface CheckinClientProps {
  phone: string;
  theme: { primary: string; bg: string; accent: string };
}

export default function CheckinClient({ phone, theme }: CheckinClientProps) {
  const [status, setStatus] = useState<"none" | "checked_in" | "checked_out">("none");
  const [checkinTime, setCheckinTime] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  // 检查今天是否已签到
  useEffect(() => {
    fetch(`/api/checkins?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((data) => {
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = data.records?.find(
          (r: any) => r.date === today
        );
        if (todayRecord) {
          if (todayRecord.checkoutTime) {
            setStatus("checked_out");
            setCheckinTime(todayRecord.checkinTime);
            setMessage(`今日已签退，服务 ${todayRecord.duration} 小时`);
          } else {
            setStatus("checked_in");
            setCheckinTime(todayRecord.checkinTime);
            setMessage(`今日已签到（${todayRecord.checkinTime}），请记得签退`);
          }
        }
      })
      .catch(() => {});
  }, [phone]);

  const handleAction = useCallback(
    async (action: "checkin" | "checkout") => {
      setLoading(true);
      setMessage("");
      setMessageType("");

      try {
        const res = await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const data = await res.json();

        if (res.ok) {
          setMessageType("success");
          if (action === "checkin") {
            setStatus("checked_in");
            const now = new Date();
            const timeStr = now.toTimeString().substring(0, 5);
            setCheckinTime(timeStr);
            setMessage(`签到成功！签到时间：${timeStr}`);
          } else {
            setStatus("checked_out");
            setMessage(`签退成功！今日服务 ${data.duration} 小时`);
          }
        } else {
          setMessageType("error");
          setMessage(data.message);
        }
      } catch {
        setMessageType("error");
        setMessage("网络错误，请稍后重试");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const now = new Date();
  const currentTime = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="text-center py-8">
      {/* 当前时间 */}
      <div className="mb-8">
        <p className="text-gray-500 text-base mb-2">当前时间</p>
        <p className="text-5xl font-bold text-gray-800">{currentTime}</p>
        <p className="text-gray-400 text-sm mt-2">
          {now.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* 状态提示 */}
      {message && (
        <div
          className={`mx-auto max-w-xs mb-8 p-4 rounded-xl text-base ${
            messageType === "error"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-600 border border-green-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="space-y-4 max-w-xs mx-auto">
        {status !== "checked_in" && (
          <button
            onClick={() => handleAction("checkin")}
            disabled={loading || status === "checked_out"}
            className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary }}
          >
            {loading && status === "none" ? "签到中..." : "📍 签 到"}
          </button>
        )}

        {status === "checked_in" && (
          <button
            onClick={() => handleAction("checkout")}
            disabled={loading}
            className="w-full h-16 rounded-2xl text-xl font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-40"
            style={{ backgroundColor: "#E65100" }}
          >
            {loading ? "签退中..." : "🏁 签 退"}
          </button>
        )}

        {status === "checked_out" && (
          <div className="p-4 bg-gray-100 rounded-xl text-gray-500 text-base">
            今天已完成 ✓<br />
            <span className="text-sm text-gray-400">签到时间：{checkinTime}</span>
          </div>
        )}
      </div>

      {/* 说明 */}
      <div className="mt-12 text-sm text-gray-400 max-w-xs mx-auto">
        <p>💡 到达现场后点击签到</p>
        <p>离开时点击签退，系统自动计算服务时长</p>
      </div>
    </div>
  );
}
