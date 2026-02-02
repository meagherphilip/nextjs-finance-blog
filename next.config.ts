import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['*.trycloudflare.com'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
