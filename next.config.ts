import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.tmdb.org",
      },
    ],
  },
};

export default nextConfig;
