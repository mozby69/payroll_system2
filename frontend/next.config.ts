import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.79",
    "192.168.1.54",
    "localhost"
  ],
};

export default nextConfig;
