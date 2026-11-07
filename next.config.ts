import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Checkout is guest-only: customer accounts were removed. Old links land somewhere useful.
  async redirects() {
    return [
      { source: "/login", destination: "/track-order", permanent: false },
      { source: "/register", destination: "/", permanent: false },
      { source: "/forgot-password", destination: "/track-order", permanent: false },
      { source: "/reset-password", destination: "/track-order", permanent: false },
      { source: "/account/wishlist", destination: "/wishlist", permanent: false },
      { source: "/account", destination: "/track-order", permanent: false },
      { source: "/account/:path*", destination: "/track-order", permanent: false },
    ];
  },
  transpilePackages: ["@abeera/shared"],
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
