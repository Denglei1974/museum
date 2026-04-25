import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 如果设置了 SCF_API_URL 且没有 MONGODB_URI，则代理 API 到 SCF
  async rewrites() {
    const scfUrl = process.env.SCF_API_URL;
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