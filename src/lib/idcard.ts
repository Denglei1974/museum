/**
 * ID 号码工具 — 纯前端计算，零依赖
 * 中国大陆身份证号 (18位)
 */

// 从身份证号提取性别和出生年月日
export function parseIdCard(idCard: string): {
  gender: "男" | "女";
  birthday: string;
  valid: boolean;
} | null {
  const cleaned = idCard.trim();
  if (cleaned.length !== 18) return null;

  // 简单校验
  const pattern = /^\d{17}[\dXx]$/;
  if (!pattern.test(cleaned)) return null;

  const year = parseInt(cleaned.substring(6, 10), 10);
  const month = parseInt(cleaned.substring(10, 12), 10);
  const day = parseInt(cleaned.substring(12, 14), 10);

  if (year < 1900 || year > new Date().getFullYear()) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // 第17位（索引16）奇数=男，偶数=女
  const genderDigit = parseInt(cleaned[16], 10);
  const gender = genderDigit % 2 === 1 ? "男" : "女";

  const birthday = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return { gender, birthday, valid: true };
}
