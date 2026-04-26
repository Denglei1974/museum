import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    // 在 EdgeOne Pages 环境排除 mongodb 原生模块
    // 运行时通过 SCF 代理访问数据库
    config.externals = config.externals || [];
    config.externals.push("mongodb");
    return config;
  },
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
