"use client";

import { useState, useEffect } from "react";

interface MyHoursClientProps {
  phone: string;
  theme: { primary: string; bg: string; accent: string };
}

interface Record {
  date: string;
  checkinTime: string;
  checkoutTime: string;
  duration: number;
  status: string;
}

export default function MyHoursClient({ phone, theme }: MyHoursClientProps) {
  const [yearTotal, setYearTotal] = useState(0);
  const [today, setToday] = useState(0);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/my-hours?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((data) => {
        setYearTotal(data.yearTotal || 0);
        setToday(data.today || 0);
        setRecords(data.records || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [phone]);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  return (
    <div>
      {/* 统计卡片 */}
      <div
        className="rounded-2xl p-6 mb-6 text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
        }}
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm opacity-90">今日</p>
            <p className="text-3xl font-bold">{today.toFixed(1)}</p>
            <p className="text-xs opacity-75">小时</p>
          </div>
          <div>
            <p className="text-sm opacity-90">年度累计</p>
            <p className="text-3xl font-bold">{yearTotal.toFixed(1)}</p>
            <p className="text-xs opacity-75">小时</p>
          </div>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">服务记录</h3>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>暂无服务记录</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((r, i) => (
              <div key={i} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{r.date}</p>
                    <p className="text-xs text-gray-400 mt-1">
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
    </div>
  );
}
