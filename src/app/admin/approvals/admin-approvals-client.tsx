"use client";

import { useState, useEffect } from "react";

interface AdminApprovalsClientProps {
  theme: { primary: string; bg: string; accent: string };
}

interface Approval {
  _id?: string;
  type: string;
  description: string;
  details: Record<string, unknown>;
  status: string;
  requestedBy: string;
  requestedByName: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewComment?: string;
  createdAt: string;
  reviewedAt?: string;
}

export default function AdminApprovalsClient({ theme }: AdminApprovalsClientProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadApprovals();
  }, [statusFilter]);

  const loadApprovals = () => {
    setLoading(true);
    fetch(`/api/approvals?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => {
        setApprovals(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/approvals?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, comment }),
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      setComment("");
      loadApprovals();
    } else {
      alert(data.message);
    }
  };

  const typeLabels: Record<string, string> = {
    checkin_fix: "签到补录",
    info_change: "信息修改",
    recruitment_change: "招募变更",
  };

  return (
    <div>
      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-gray-200 rounded-lg"
        >
          <option value="pending">待审批</option>
          <option value="approved">已通过</option>
          <option value="rejected">已驳回</option>
          <option value="all">全部</option>
        </select>
      </div>

      {/* 审批列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
          <p>暂无审批记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((item) => {
            const isPending = item.status === "pending";
            const details = item.details || {};

            return (
              <div
                key={String(item._id)}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {typeLabels[item.type] || item.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status === "pending"
                          ? "待审批"
                          : item.status === "approved"
                            ? "已通过"
                            : "已驳回"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{item.createdAt?.split("T")[0]}</span>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{item.description}</p>

                  {item.type === "checkin_fix" && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                      <p>📱 {details.phone as string}</p>
                      <p>📅 {details.date as string}</p>
                      <p>🕐 {details.checkinTime as string} → {details.checkoutTime as string}</p>
                      <p>⏱️ {(details.duration as number)?.toFixed(1)} 小时</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    申请人：{item.requestedByName} · {item.createdAt?.split("T")[0]}
                  </p>

                  {item.reviewedByName && (
                    <p className="text-xs text-gray-400 mt-1">
                      审批人：{item.reviewedByName} · {item.reviewedAt?.split("T")[0]}
                      {item.reviewComment && ` · ${item.reviewComment}`}
                    </p>
                  )}

                  {/* 审批操作 */}
                  {isPending && (
                    <div className="mt-3 pt-3 border-t flex gap-2">
                      <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="审批意见（可选）"
                        className="flex-1 h-10 px-3 text-sm border rounded-lg"
                      />
                      <button
                        onClick={() => handleAction(String(item._id), "approve")}
                        className="h-10 px-4 text-sm bg-green-600 text-white rounded-lg"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => handleAction(String(item._id), "reject")}
                        className="h-10 px-4 text-sm bg-red-500 text-white rounded-lg"
                      >
                        驳回
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
