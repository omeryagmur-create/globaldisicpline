import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'shadcnblocks.com',
      },
      {
        protocol: 'https',
        hostname: 'deifkwefumgah.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'www.shadcnblocks.com',
      },
    ],
  },
};

export default nextConfig;
