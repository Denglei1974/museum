import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 如果设置了 MUSEUM_API_URL，则代理 API 请求到 SCF 云函数
  async rewrites() {
    const scfUrl = process.env.MUSEUM_API_URL;
    if (scfUrl) {
      return [
        {
          source: "/api/:path*",
          destination: `${scfUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;