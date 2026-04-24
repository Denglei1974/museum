"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface ReportsClientProps {
  theme: { primary: string; bg: string; accent: string };
}

interface ReportRecord {
  phone: string;
  name: string;
  date: string;
  duration: number;
}

export default function ReportsClient({ theme }: ReportsClientProps) {
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState("");

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?year=${year}&category=${category}`);
      const data = await res.json();
      setRecords(data.items || []);
    } catch {
      alert("加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (records.length === 0) {
      alert("没有数据可导出");
      return;
    }

    // 按手机号分组统计
    const grouped: Record<string, { name: string; phone: string; total: number; count: number; records: ReportRecord[] }> = {};
    records.forEach((r) => {
      if (!grouped[r.phone]) {
        grouped[r.phone] = { name: r.name, phone: r.phone, total: 0, count: 0, records: [] };
      }
      grouped[r.phone].total += r.duration;
      grouped[r.phone].count += 1;
      grouped[r.phone].records.push(r);
    });

    const summaryData = Object.values(grouped).map((g) => ({
      姓名: g.name,
      手机号: g.phone,
      服务次数: g.count,
      "总时长(小时)": g.total.toFixed(1),
    }));

    const ws = XLSX.utils.json_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${year}年时长汇总`);
    XLSX.writeFile(wb, `时长报表_${year}${category ? `_${category}` : ""}.xlsx`);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div>
      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-lg"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-lg"
          >
            <option value="">全部类别</option>
            <option value="social_volunteer">社会志愿者</option>
            <option value="university_volunteer">高校志愿者</option>
            <option value="youth_volunteer">青少年志愿者</option>
          </select>
          <button
            onClick={loadReport}
            disabled={loading}
            className="h-10 px-4 text-sm text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? "加载中..." : "查询"}
          </button>
          <button
            onClick={handleExport}
            className="h-10 px-4 text-sm bg-green-600 text-white rounded-lg"
          >
            📤 导出 Excel
          </button>
        </div>
      </div>

      {/* 汇总表格 */}
      {records.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-base font-bold text-gray-800">
              {year}年时长汇总
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-600">姓名</th>
                  <th className="text-left p-3 font-semibold text-gray-600">手机号</th>
                  <th className="text-center p-3 font-semibold text-gray-600">服务次数</th>
                  <th className="text-right p-3 font-semibold text-gray-600">总时长</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(
                  records.reduce(
                    (acc, r) => {
                      if (!acc[r.phone]) acc[r.phone] = { name: r.name, count: 0, total: 0 };
                      acc[r.phone].count += 1;
                      acc[r.phone].total += r.duration;
                      return acc;
                    },
                    {} as Record<string, { name: string; count: number; total: number }>
                  )
                ).map(([phone, data]) => (
                  <tr key={phone} className="hover:bg-gray-50">
                    <td className="p-3">{data.name}</td>
                    <td className="p-3">{phone}</td>
                    <td className="p-3 text-center">{data.count}</td>
                    <td className="p-3 text-right font-semibold" style={{ color: theme.primary }}>
                      {data.total.toFixed(1)} 小时
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && records.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
          <p>选择条件后查询</p>
        </div>
      )}
    </div>
  );
}
