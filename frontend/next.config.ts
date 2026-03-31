import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.79",
    "192.168.1.124",
    "192.168.1.219",
    "192.168.1.180",
    "localhost"
  ],
};

export default nextConfig;
