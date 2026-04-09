import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable image optimization for simpler deployment
  images: { unoptimized: true },
};

export default nextConfig;
