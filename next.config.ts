import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/topis-saas",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
