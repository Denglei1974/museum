/**
 * API 代理处理器
 * 
 * 在 EdgeOne Pages 环境中，API 路由不能直接使用 mongodb 原生模块。
 * 当 MUSEUM_API_URL 存在时，将请求代理到 SCF 云函数。
 * 
 * 用法：在每个 API 路由文件顶部调用 getProxyResponse()，
 * 如果有返回值则直接 return，否则继续执行本地 MongoDB 逻辑。
 */

import { NextRequest, NextResponse } from "next/server";

const SCF_URL = process.env.MUSEUM_API_URL;

export async function getProxyResponse(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!SCF_URL) {
    return null; // 本地开发，继续执行 MongoDB 逻辑
  }

  try {
    const url = new URL(request.url);
    const scfTarget = `${SCF_URL}${url.pathname}${url.search}`;

    const body = request.body ? await request.arrayBuffer() : undefined;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // 转发必要的 header，排除特定主机头
      if (
        key.toLowerCase() !== "host" &&
        key.toLowerCase() !== "connection"
      ) {
        headers.set(key, value);
      }
    });

    const res = await fetch(scfTarget, {
      method: request.method,
      headers,
      body,
    });

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== "content-encoding" &&
        key.toLowerCase() !== "transfer-encoding" &&
        key.toLowerCase() !== "connection"
      ) {
        responseHeaders.set(key, value);
      }
    });

    // 转发 cookie header 以保持认证状态
    const cookieHeader = res.headers.get("set-cookie");
    if (cookieHeader) {
      responseHeaders.set("set-cookie", cookieHeader);
    }

    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("SCF proxy error:", err);
    return NextResponse.json(
      { message: "代理服务错误" },
      { status: 502 },
    );
  }
}
