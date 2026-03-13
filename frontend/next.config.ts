import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.77",
    "192.168.1.180",
    "localhost"
  ],
};

export default nextConfig;
