import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force static export — pure SPA, zero SSR, zero hydration
  output: "export",
  // Disable image optimization (not available in static export)
  images: { unoptimized: true },
};

export default nextConfig;
