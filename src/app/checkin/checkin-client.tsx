"use client";

import { useState, useEffect } from "react";

// 博物馆GPS坐标（沈阳张氏帅府）
const MUSEUM_LAT = 41.791944;
const MUSEUM_LNG = 123.463083;
const ALLOWED_RADIUS = 100; // 米

// Haversine公式计算两点距离（米）
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface CheckinClientProps {
  phone: string;
  username: string;
  role: string;
  theme: { primary: string; bg: string; accent: string };
}

export default function CheckinClient({ phone, username, role, theme }: CheckinClientProps) {
  const [status, setStatus] = useState<"none" | "checked_in" | "checked_out">("none");
  const [checkinTime, setCheckinTime] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"checking" | "in_range" | "out_of_range" | "error">("checking");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // 检查GPS定位
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = calcDistance(pos.coords.latitude, pos.coords.longitude, MUSEUM_LAT, MUSEUM_LNG);
        setGpsStatus(dist <= ALLOWED_RADIUS ? "in_range" : "out_of_range");
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // 检查今日签到状态
  useEffect(() => {
    fetch(`/api/checkins?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((data) => {
        const today = new Date().toISOString().split("T")[0];
        const record = data.records?.find((r: any) => r.date === today);
        if (record) {
          if (record.checkoutTime) {
            setStatus("checked_out");
            setCheckinTime(record.checkinTime);
            setCheckoutTime(record.checkoutTime);
          } else {
            setStatus("checked_in");
            setCheckinTime(record.checkinTime);
          }
        }
      })
      .catch(() => {});
  }, [phone]);

  const handleAction = async () => {
    if (!confirmed || gpsStatus !== "in_range") return;
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const action = status === "none" ? "checkin" : "checkout";
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (res.ok) {
        const now = new Date();
        const timeStr = now.toTimeString().substring(0, 5);
        if (action === "checkin") {
          setStatus("checked_in");
          setCheckinTime(timeStr);
        } else {
          setStatus("checked_out");
          setCheckoutTime(timeStr);
        }
        setMessageType("success");
        setMessage(action === "checkin" ? "签到成功！" : `签退成功！今日服务 ${data.duration} 小时`);
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
  };

  const btnDisabled = !confirmed || gpsStatus !== "in_range" || status === "checked_out" || loading;

  return (
    <div className="py-4">
      {/* 顶部个人信息卡片 */}
      <div className="mx-4 mb-5 p-5 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.5)" }}>
        <div className="flex items-center gap-3">
          {/* 头像SVG */}
          <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-800">{username}</p>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>

        {/* 今日岗位区域（暂时隐藏，等派位功能做好再加）}
        {/*
        <div className="mt-3 pt-3 border-t border-gray-200/60">
          <p className="text-xs text-gray-400 mb-1">今日岗位</p>
          <p className="text-sm text-gray-700">09:00-10:00 服务中心</p>
          <p className="text-sm text-gray-700">10:00-11:00 志愿者岗亭</p>
        </div>
        */}
      </div>

      {/* 上岗/下岗状态卡片 */}
      <div className="flex gap-3 mx-4 mb-6">
        <div
          className={`flex-1 p-4 rounded-xl text-center transition-colors ${
            status !== "none" ? "text-white shadow-sm" : "bg-gray-200 text-gray-400"
          }`}
          style={status !== "none" ? { backgroundColor: "#4CAF50" } : {}}
        >
          <p className="text-sm font-medium">上岗</p>
          <p className="text-xs mt-2">
            {status !== "none" ? `已签到: ${checkinTime}` : "未签到"}
          </p>
        </div>
        <div
          className={`flex-1 p-4 rounded-xl text-center transition-colors ${
            status === "checked_out" ? "text-white shadow-sm" : "bg-gray-200 text-gray-400"
          }`}
          style={status === "checked_out" ? { backgroundColor: "#4CAF50" } : {}}
        >
          <p className="text-sm font-medium">下岗</p>
          <p className="text-xs mt-2">
            {status === "checked_out" ? `已签到: ${checkoutTime}` : "未签到"}
          </p>
        </div>
      </div>

      {/* 大圆形签到按钮 */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleAction}
          disabled={btnDisabled}
          className={`w-36 h-36 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-all ${
            btnDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "text-white active:scale-95"
          }`}
          style={btnDisabled ? {} : { backgroundColor: "#66BB6A" }}
        >
          {loading ? "..." : "签到"}
        </button>
      </div>

      {/* GPS定位状态提示 */}
      <div className="flex items-center justify-center gap-2 mb-4 px-4">
        {gpsStatus === "checking" && (
          <>
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-400">正在获取定位...</span>
          </>
        )}
        {gpsStatus === "in_range" && (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-green-600">您已经进入定位打卡签到签退范围</span>
          </>
        )}
        {gpsStatus === "out_of_range" && (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm text-red-500">您不在打卡范围内，请靠近博物馆</span>
          </>
        )}
        {gpsStatus === "error" && (
          <>
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-500">请开启GPS定位</span>
          </>
        )}
      </div>

      {/* 确认框 */}
      <div className="flex items-center justify-center mb-6 px-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 accent-green-600"
          />
          <span className="text-sm text-gray-600">防止误操作提醒，勾选后可启动打卡按钮</span>
        </label>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`mx-4 p-3 rounded-xl text-sm text-center ${
            messageType === "error"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-600 border border-green-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
