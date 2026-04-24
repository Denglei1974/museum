"use client";

import { useState, useEffect } from "react";

interface AdminCheckinsClientProps {
  theme: { primary: string; bg: string; accent: string };
}

interface CheckinRecord {
  _id?: string;
  phone: string;
  username: string;
  date: string;
  checkinTime: string;
  checkoutTime: string;
  duration: number;
  status: string;
}

export default function AdminCheckinsClient({ theme }: AdminCheckinsClientProps) {
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

  // 补录表单
  const [showFix, setShowFix] = useState(false);
  const [fixForm, setFixForm] = useState({
    phone: "",
    date: dateFilter,
    checkinTime: "09:00",
    checkoutTime: "12:00",
    reason: "",
  });

  useEffect(() => {
    loadRecords();
  }, [dateFilter]);

  const loadRecords = () => {
    setLoading(true);
    fetch(`/api/checkins?date=${dateFilter}`)
      .then((r) => r.json())
      .then((data) => {
        setRecords(data.records || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleFixSubmit = async () => {
    if (!fixForm.phone || !fixForm.date) {
      alert("请填写手机号和日期");
      return;
    }

    // 计算时长
    const [inH, inM] = fixForm.checkinTime.split(":").map(Number);
    const [outH, outM] = fixForm.checkoutTime.split(":").map(Number);
    let duration = (outH + outM / 60) - (inH + inM / 60);
    if (duration < 0) duration += 24;
    duration = Math.round(duration * 10) / 10;

    // 提交审批
    const res = await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "checkin_fix",
        description: `补录签到：${fixForm.phone} ${fixForm.date} ${fixForm.checkinTime}-${fixForm.checkoutTime}`,
        details: {
          phone: fixForm.phone,
          date: fixForm.date,
          checkinTime: fixForm.checkinTime,
          checkoutTime: fixForm.checkoutTime,
          duration,
        },
      }),
    });
    const data = await res.json();

    if (res.ok) {
      alert("已提交审批，等待审核管理员批准");
      setShowFix(false);
      setFixForm({
        phone: "",
        date: dateFilter,
        checkinTime: "09:00",
        checkoutTime: "12:00",
        reason: "",
      });
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      {/* 操作栏 */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-gray-200 rounded-lg"
        />
        <button
          onClick={() => setShowFix(true)}
          className="h-10 px-4 text-sm text-white rounded-lg active:scale-95 transition-transform"
          style={{ backgroundColor: theme.primary }}
        >
          ✏️ 补录签到
        </button>
      </div>

      {/* 补录弹窗 */}
      {showFix && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">补录签到</h3>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={fixForm.phone}
                onChange={(e) => setFixForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="志愿者手机号"
                className="w-full h-10 px-3 text-sm border rounded-lg"
              />
              <input
                type="date"
                value={fixForm.date}
                onChange={(e) => setFixForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full h-10 px-3 text-sm border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={fixForm.checkinTime}
                  onChange={(e) => setFixForm((p) => ({ ...p, checkinTime: e.target.value }))}
                  className="h-10 px-3 text-sm border rounded-lg"
                />
                <input
                  type="time"
                  value={fixForm.checkoutTime}
                  onChange={(e) => setFixForm((p) => ({ ...p, checkoutTime: e.target.value }))}
                  className="h-10 px-3 text-sm border rounded-lg"
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={() => setShowFix(false)} className="flex-1 h-10 rounded-lg border">
                取消
              </button>
              <button
                onClick={handleFixSubmit}
                className="flex-1 h-10 rounded-lg text-white"
                style={{ backgroundColor: theme.primary }}
              >
                提交审批
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 签到记录列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {records.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>当天无签到记录</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {records.map((r) => (
                <div key={String(r._id)} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{r.username}</p>
                      <p className="text-xs text-gray-400 mt-1">📱 {r.phone}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {r.checkinTime} → {r.checkoutTime || "未签退"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: theme.primary }}>
                        {r.duration.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-400">小时</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
