import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@abeera/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
