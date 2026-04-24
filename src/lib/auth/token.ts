/**
 * Cookie Token 认证中间件
 * 轻量级方案：不依赖 next-auth，直接用 Cookie
 */

import { NextRequest } from "next/server";

export interface TokenPayload {
  id: string;
  phone: string;
  role: string;
  username: string;
  mustChangePassword?: boolean;
}

const COOKIE_NAME = "auth-token";

// UTF-8 安全的 base64 编码/解码
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToUtf8(str: string): string {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// 生成 Token
export function generateToken(payload: TokenPayload): string {
  const data = {
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24小时
  };
  return utf8ToBase64(JSON.stringify(data));
}

// 解析并验证 Token
export function verifyToken(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const json = base64ToUtf8(token);
    const data = JSON.parse(json) as TokenPayload & { exp: number };
    if (Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}
