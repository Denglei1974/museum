"use client";

import { useState, useEffect, useRef } from "react";
import { VOLUNTEER_TYPES, POSITION_TYPES } from "@/lib/auth/roles";
import { parseIdCard } from "@/lib/idcard";

// 导入 xlsx 库
import * as XLSX from "xlsx";

interface AdminVolunteersClientProps {
  theme: { primary: string; bg: string; accent: string };
}

interface Volunteer {
  _id?: string;
  phone: string;
  name: string;
  idCard: string;
  gender: string;
  birthday: string;
  address: string;
  school: string;
  volunteerType: string;
  position: string;
  specialty: string;
}

export default function AdminVolunteersClient({ theme }: AdminVolunteersClientProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState("");

  // 新增表单
  const [form, setForm] = useState({
    phone: "",
    name: "",
    idCard: "",
    gender: "",
    address: "",
    school: "",
    volunteerType: "social_volunteer",
    position: "",
    specialty: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set("category", filterType);
    if (keyword) params.set("keyword", keyword);

    fetch(`/api/volunteers?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setVolunteers(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleIdCardChange = (value: string) => {
    setForm((prev) => {
      const result = { ...prev, idCard: value };
      const parsed = parseIdCard(value);
      if (parsed) {
        return { ...result, gender: parsed.gender };
      }
      return result;
    });
  };

  const handleAdd = async () => {
    if (!form.phone || !form.name) {
      alert("请填写手机号和姓名");
      return;
    }

    const res = await fetch("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      setShowAdd(false);
      setForm({
        phone: "",
        name: "",
        idCard: "",
        gender: "",
        address: "",
        school: "",
        volunteerType: "social_volunteer",
        position: "",
        specialty: "",
      });
      loadVolunteers();
    } else {
      alert(data.message);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

        const volunteers = rows.map((row) => {
          const idCard = (row["身份证号"] || "").toString();
          const parsed = parseIdCard(idCard);
          return {
            phone: (row["手机号"] || "").toString(),
            name: (row["姓名"] || "").toString(),
            idCard,
            gender: parsed?.gender || "",
            birthday: parsed?.birthday || "",
            address: (row["住址"] || "").toString(),
            school: (row["单位/学校"] || "").toString(),
            volunteerType: (row["志愿者类别"] || "social_volunteer").toString(),
            position: (row["岗位"] || "").toString(),
            specialty: (row["特长"] || "").toString(),
          };
        });

        const res = await fetch("/api/volunteers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ volunteers }),
        });
        const result = await res.json();
        alert(result.message);
        loadVolunteers();
      } catch {
        alert("文件解析失败");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(
      volunteers.map((v) => ({
        姓名: v.name,
        手机号: v.phone,
        身份证号: v.idCard,
        性别: v.gender,
        出生日期: v.birthday,
        住址: v.address,
        "单位/学校": v.school,
        志愿者类别: v.volunteerType,
        岗位: v.position,
        特长: v.specialty,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "志愿者名单");
    XLSX.writeFile(wb, `志愿者名单_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div>
      {/* 操作栏 */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadVolunteers()}
            placeholder="搜索姓名/手机/单位/特长"
            className="flex-1 min-w-[150px] h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">全部类别</option>
            {VOLUNTEER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            onClick={loadVolunteers}
            className="h-10 px-4 text-sm text-white rounded-lg"
            style={{ backgroundColor: theme.primary }}
          >
            搜索
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
          <button
            onClick={() => setShowAdd(true)}
            className="h-10 px-4 text-sm text-white rounded-lg active:scale-95 transition-transform"
            style={{ backgroundColor: theme.primary }}
          >
            + 手动录入
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-4 text-sm bg-blue-500 text-white rounded-lg active:scale-95 transition-transform"
          >
            📥 Excel 导入
          </button>
          <button
            onClick={handleExport}
            className="h-10 px-4 text-sm bg-green-600 text-white rounded-lg active:scale-95 transition-transform"
          >
            📤 Excel 导出
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileImport}
          />
        </div>
      </div>

      {/* 添加表单弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">新增志愿者</h3>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="姓名 *"
                className="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="手机号 *"
                className="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                value={form.idCard}
                onChange={(e) => handleIdCardChange(e.target.value)}
                placeholder="身份证号（自动识别性别）"
                className="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="住址"
                className="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                value={form.school}
                onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))}
                placeholder="单位/学校"
                className="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <select
                value={form.volunteerType}
                onChange={(e) => setForm((p) => ({ ...p, volunteerType: e.target.value }))}
                className="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
              >
                {VOLUNTEER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                className="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">选择岗位</option>
                {POSITION_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                value={form.specialty}
                onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
                placeholder="特长"
                className="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 h-10 rounded-lg border border-gray-200 text-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 h-10 rounded-lg text-white"
                style={{ backgroundColor: theme.primary }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 志愿者列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {volunteers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>暂无数据</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {volunteers.map((v) => (
                <div key={String(v._id)} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {v.name}
                        {v.gender && (
                          <span className="ml-1 text-xs font-normal text-gray-400">
                            ({v.gender})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">📱 {v.phone}</p>
                      {v.school && <p className="text-xs text-gray-400">🏢 {v.school}</p>}
                      {v.position && <p className="text-xs text-gray-400">🏷️ {v.position}</p>}
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {v.volunteerType === "social_volunteer"
                        ? "社会"
                        : v.volunteerType === "university_volunteer"
                          ? "高校"
                          : "青少年"}
                    </span>
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
