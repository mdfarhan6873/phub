import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'streamtape.com',
        port: '',
        pathname: '/get_thumbnail/**',
      },
      {
        protocol: 'https',
        hostname: 'thumb.tapecontent.net',
        port: '',
        pathname: '/thumb/**',
      },
    ],
  },
};

export default nextConfig;
