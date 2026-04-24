"use client";

import { useState, useEffect } from "react";

interface AdminRecruitmentsClientProps {
  theme: { primary: string; bg: string; accent: string };
  canPublish: boolean;
}

interface Recruitment {
  _id?: string;
  title: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxPeople: number;
  positions: string[];
  location: string;
  status: string;
}

export default function AdminRecruitmentsClient({
  theme,
  canPublish,
}: AdminRecruitmentsClientProps) {
  const [items, setItems] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");

  const [form, setForm] = useState({
    title: "",
    type: "daily",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    maxPeople: 0,
    positions: "",
    location: "",
  });

  useEffect(() => {
    loadItems();
  }, [statusFilter]);

  const loadItems = () => {
    setLoading(true);
    fetch(`/api/recruitments?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.title || !form.startDate) {
      alert("请填写标题和开始日期");
      return;
    }

    const res = await fetch("/api/recruitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        positions: form.positions ? form.positions.split(/[,，]/).map((s) => s.trim()) : ["通用"],
      }),
    });
    const data = await res.json();

    if (res.ok) {
      alert("创建成功");
      setShowAdd(false);
      setForm({
        title: "",
        type: "daily",
        description: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        maxPeople: 0,
        positions: "",
        location: "",
      });
      loadItems();
    } else {
      alert(data.message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const res = await fetch(`/api/recruitments?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) loadItems();
  };

  return (
    <div>
      {/* 操作栏 */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-gray-200 rounded-lg"
        >
          <option value="active">进行中</option>
          <option value="inactive">已结束</option>
          <option value="all">全部</option>
        </select>

        {canPublish && (
          <button
            onClick={() => setShowAdd(true)}
            className="h-10 px-4 text-sm text-white rounded-lg active:scale-95 transition-transform"
            style={{ backgroundColor: theme.primary }}
          >
            + 发布招募
          </button>
        )}
      </div>

      {/* 添加弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">发布招募</h3>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="活动标题 *"
                className="w-full h-10 px-3 text-sm border rounded-lg"
              />
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full h-10 px-3 text-sm border rounded-lg"
              >
                <option value="daily">日常服务</option>
                <option value="special">特殊活动</option>
              </select>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="活动描述"
                className="w-full h-20 px-3 py-2 text-sm border rounded-lg resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="h-10 px-3 text-sm border rounded-lg"
                />
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="h-10 px-3 text-sm border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  className="h-10 px-3 text-sm border rounded-lg"
                />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                  className="h-10 px-3 text-sm border rounded-lg"
                />
              </div>
              <input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="地点"
                className="w-full h-10 px-3 text-sm border rounded-lg"
              />
              <input
                type="number"
                value={form.maxPeople || ""}
                onChange={(e) => setForm((p) => ({ ...p, maxPeople: Number(e.target.value) }))}
                placeholder="招募人数（0为不限）"
                className="w-full h-10 px-3 text-sm border rounded-lg"
              />
              <input
                value={form.positions}
                onChange={(e) => setForm((p) => ({ ...p, positions: e.target.value }))}
                placeholder="岗位（逗号分隔，如：讲解,引导）"
                className="w-full h-10 px-3 text-sm border rounded-lg"
              />
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-10 rounded-lg border">
                取消
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 h-10 rounded-lg text-white"
                style={{ backgroundColor: theme.primary }}
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
          <p>暂无招募活动</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={String(item._id)} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-800">{item.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status === "active" ? "进行中" : "已结束"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.type === "daily" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.type === "daily" ? "日常" : "特殊"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    📅 {item.startDate}{item.endDate !== item.startDate ? ` ~ ${item.endDate}` : ""}
                    {item.startTime ? ` ${item.startTime}-${item.endTime}` : ""}
                  </p>
                  {item.location && <p className="text-xs text-gray-400 mt-1">📍 {item.location}</p>}
                </div>
                {canPublish && (
                  <button
                    onClick={() => toggleStatus(String(item._id), item.status)}
                    className="text-xs text-gray-400 hover:text-gray-600 ml-2"
                  >
                    {item.status === "active" ? "结束" : "重新开启"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
