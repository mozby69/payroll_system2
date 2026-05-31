import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.163",
    "192.168.1.124",
    "192.168.1.219",
    "192.168.1.180",
    "192.168.1.219",
    "192.168.1.217",
    "localhost"
  ],
};

export default nextConfig;
