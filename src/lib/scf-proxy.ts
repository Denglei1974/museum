/**
 * SCF 请求转发 — 本地和 EdgeOne 都统一走 SCF
 */
import { NextRequest, NextResponse } from "next/server";

const SCF_URL = process.env.MUSEUM_API_URL;

export async function scfProxy(request: NextRequest): Promise<NextResponse> {
  if (!SCF_URL) {
    return NextResponse.json(
      { message: "请设置环境变量 MUSEUM_API_URL" },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const target = `${SCF_URL}${url.pathname}${url.search}`;

  const headers = new Headers();
  request.headers.forEach((v, k) => {
    const kl = k.toLowerCase();
    if (kl !== "host" && kl !== "connection") headers.set(k, v);
  });

  const init: RequestInit = { method: request.method, headers };
  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.arrayBuffer();
    if (body.byteLength > 0) {
      (init as any).body = body;
    }
  }

  const res = await fetch(target, init);
  const resHeaders = new Headers();
  res.headers.forEach((v, k) => {
    const kl = k.toLowerCase();
    if (kl !== "content-encoding" && kl !== "transfer-encoding") resHeaders.set(k, v);
  });

  const body = await res.arrayBuffer();
  return new NextResponse(body, { status: res.status, headers: resHeaders });
}
