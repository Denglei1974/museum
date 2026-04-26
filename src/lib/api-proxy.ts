/**
 * API 代理 - 调用腾讯云 SCF
 * 用于 EdgeOne Pages 环境（不支持 mongodb 原生驱动）
 */

const API_URL = process.env.MUSEUM_API_URL || "";

// 判断是否在 EdgeOne Pages 环境（通过 SCF 代理）
const isEdgeEnv = !process.env.MONGODB_URI || process.env.MUSEUM_API_URL;

// SCF 代理请求封装
async function scfFetch(path: string, options: RequestInit = {}) {
  if (!API_URL) {
    throw new Error("请设置环境变量 MUSEUM_API_URL");
  }
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

// 导出 SCF API 方法
export const ScfApi = {
  // 认证
  login: async (phone: string, password: string) => {
    return scfFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
  },
  logout: async () => {
    return scfFetch("/api/auth/logout", { method: "POST" });
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    return scfFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  // 用户
  createUser: async (data: object) => {
    return scfFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 志愿者
  getVolunteers: async (category?: string, keyword?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (keyword) params.set("keyword", keyword);
    return scfFetch(`/api/volunteers?${params}`);
  },
  createVolunteer: async (data: object) => {
    return scfFetch("/api/volunteers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  importVolunteers: async (volunteers: object[]) => {
    return scfFetch("/api/volunteers", {
      method: "PATCH",
      body: JSON.stringify({ volunteers }),
    });
  },

  // 招募
  getRecruitments: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    return scfFetch(`/api/recruitments?${params}`);
  },
  createRecruitment: async (data: object) => {
    return scfFetch("/api/recruitments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateRecruitment: async (id: string, status: string) => {
    return scfFetch(`/api/recruitments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // 签到
  getCheckins: async (phone?: string, date?: string) => {
    const params = new URLSearchParams();
    if (phone) params.set("phone", phone);
    if (date) params.set("date", date);
    return scfFetch(`/api/checkins?${params}`);
  },
  doCheckin: async (action: "checkin" | "checkout", recruitmentId?: string) => {
    return scfFetch("/api/checkins", {
      method: "POST",
      body: JSON.stringify({ action, recruitmentId }),
    });
  },

  // 我的时长
  getMyHours: async (phone?: string, year?: string) => {
    const params = new URLSearchParams();
    if (phone) params.set("phone", phone);
    if (year) params.set("year", year);
    return scfFetch(`/api/my-hours?${params}`);
  },

  // 报名
  getSignups: async (recruitmentId: string) => {
    return scfFetch(`/api/signups?recruitmentId=${recruitmentId}`);
  },
  createSignup: async (recruitmentId: string) => {
    return scfFetch("/api/signups", {
      method: "POST",
      body: JSON.stringify({ recruitmentId }),
    });
  },

  // 审批
  getApprovals: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    return scfFetch(`/api/approvals?${params}`);
  },
  createApproval: async (data: object) => {
    return scfFetch("/api/approvals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  reviewApproval: async (id: string, action: "approve" | "reject", comment?: string) => {
    return scfFetch(`/api/approvals?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action, comment }),
    });
  },

  // 报表
  getReports: async (year?: string, category?: string) => {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (category) params.set("category", category);
    return scfFetch(`/api/reports?${params}`);
  },
};

export { isEdgeEnv };