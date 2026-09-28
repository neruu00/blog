import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  /** 이력서 등 외부에 걸린 /about 링크를 포트폴리오(/projects)로 보낸다 */
  async redirects() {
    return [{ source: '/about', destination: '/projects', permanent: true }];
  },
};

export default nextConfig;
