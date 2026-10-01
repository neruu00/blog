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
  /** 이력서 등 외부에 걸린 예전 주소(/about, /projects)를 포트폴리오(/portfolio)의 같은 창으로 보낸다 */
  async redirects() {
    return [
      { source: '/about', destination: '/portfolio/about', permanent: true },
      { source: '/projects', destination: '/portfolio/project', permanent: true },
      {
        source: '/projects/:projectName',
        destination: '/portfolio/project/:projectName',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
