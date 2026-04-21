/**
 * 密码加密/验证 — Web Crypto API（Edge + Node 通用）
 * PBKDF2 + 随机 salt，纯前端兼容，不依赖 Node.js 原生模块
 */

// 随机生成 salt（16 字节）
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// ArrayBuffer / Uint8Array → hex string
function toHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// hex string → Uint8Array
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100_000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  // 格式: salt(32hex):hash(64hex)
  return `${toHex(salt)}:${toHex(derived)}`;
}

export async function comparePassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  const [saltHex, expectedHash] = hashed.split(":");
  if (!saltHex || !expectedHash) return false;

  const salt = fromHex(saltHex);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100_000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return toHex(derived) === expectedHash;
}
