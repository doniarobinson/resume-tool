import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Analyze calls Gemini twice + LLM; default ~30s proxy limit causes "socket hang up".
  experimental: {
    proxyTimeout: 180_000,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      {
        source: "/health",
        destination: "http://127.0.0.1:8000/health",
      },
    ];
  },
};

export default nextConfig;
