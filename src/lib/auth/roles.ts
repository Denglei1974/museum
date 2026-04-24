/**
 * 角色定义与权限系统
 */

export const ROLES = {
  // 志愿者
  SOCIAL_VOLUNTEER: "social_volunteer",       // 社会志愿者
  UNIVERSITY_VOLUNTEER: "university_volunteer", // 高校志愿者
  YOUTH_VOLUNTEER: "youth_volunteer",          // 青少年志愿者

  // 组长/负责人（只读查看对应队伍）
  UNIVERSITY_LEADER: "university_leader",     // 高校负责人
  SOCIAL_LEADER: "social_leader",              // 社会组长
  YOUTH_ADMIN: "youth_admin",                 // 青少年专属管理员

  // 管理角色
  PUBLISH_ADMIN: "publish_admin",             // 发布管理员
  REVIEW_ADMIN: "review_admin",               // 审核管理员
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// 志愿者类别
export const VOLUNTEER_TYPES = [
  { value: ROLES.SOCIAL_VOLUNTEER, label: "社会志愿者" },
  { value: ROLES.UNIVERSITY_VOLUNTEER, label: "高校志愿者" },
  { value: ROLES.YOUTH_VOLUNTEER, label: "青少年志愿者" },
] as const;

// 岗位类别
export const POSITION_TYPES = [
  "讲解",
  "引导",
  "咨询",
  "秩序维护",
  "摄影",
  "司机",
  "后勤",
  "特殊活动",
  "其他",
] as const;

// 权限检查
export function isVolunteer(role: string): boolean {
  return role === ROLES.SOCIAL_VOLUNTEER || role === ROLES.UNIVERSITY_VOLUNTEER || role === ROLES.YOUTH_VOLUNTEER;
}

export function isLeader(role: string): boolean {
  return role === ROLES.UNIVERSITY_LEADER || role === ROLES.SOCIAL_LEADER || role === ROLES.YOUTH_ADMIN;
}

export function isPublishAdmin(role: string): boolean {
  return role === ROLES.PUBLISH_ADMIN;
}

export function isReviewAdmin(role: string): boolean {
  return role === ROLES.REVIEW_ADMIN;
}

export function isAdmin(role: string): boolean {
  return isLeader(role) || isPublishAdmin(role) || isReviewAdmin(role);
}

// 获取可查询的志愿者类别（用于组长/负责人权限过滤）
export function getLeaderScope(role: string): string | null {
  switch (role) {
    case ROLES.UNIVERSITY_LEADER:
      return ROLES.UNIVERSITY_VOLUNTEER;
    case ROLES.SOCIAL_LEADER:
      return ROLES.SOCIAL_VOLUNTEER;
    case ROLES.YOUTH_ADMIN:
      return ROLES.YOUTH_VOLUNTEER;
    default:
      return null;
  }
}

// 界面配色方案 (accept string)
export function getThemeByRole(role: string | undefined) {
  if (!role) return { primary: "#4A90D9", bg: "#F0F7FF", accent: "#357ABD" };

  if (isVolunteer(role)) {
    return {
      primary: "#2E7D32",     // 绿色 — 志愿者
      bg: "#E8F5E9",
      accent: "#1B5E20",
    };
  }

  if (isLeader(role)) {
    return {
      primary: "#E65100",     // 橙色 — 组长
      bg: "#FFF3E0",
      accent: "#BF360C",
    };
  }

  // 管理员 — 深蓝色
  return {
    primary: "#1565C0",
    bg: "#E3F2FD",
    accent: "#0D47A1",
  };
}

// 角色显示名称
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    social_volunteer: "社会志愿者",
    university_volunteer: "高校志愿者",
    youth_volunteer: "青少年志愿者",
    university_leader: "高校负责人",
    social_leader: "社会组长",
    youth_admin: "青少年管理员",
    publish_admin: "发布管理员",
    review_admin: "审核管理员",
  };
  return labels[role] || role;
}
