import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/answers/:slug",
        destination: "/guide/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
