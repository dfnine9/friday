import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set TAURI_BUILD=1 to enable static export for desktop app
  ...(process.env.TAURI_BUILD === "1" ? { output: "export" as const } : {}),
  images: { unoptimized: true },
  serverExternalPackages: ["@anthropic-ai/claude-code"],
};

export default nextConfig;
