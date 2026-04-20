import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async rewrites() {
    return [
      {
        source: "/api/image-proxy/:path*",
        destination: "https://static.wixstatic.com/:path*",
      },
    ];
  },
};

export default nextConfig;