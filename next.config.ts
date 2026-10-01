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
  /**
   * 이력서 등 외부에 걸린 예전 주소(/about, /projects)를 포트폴리오로 보낸다.
   * 포트폴리오의 창은 가상 경로라 open 파라미터로 넘기면 들어오자마자 그 창을 연다
   */
  async redirects() {
    return [
      { source: '/about', destination: '/portfolio?open=about', permanent: true },
      { source: '/projects', destination: '/portfolio?open=project', permanent: true },
      {
        source: '/projects/:projectName',
        destination: '/portfolio?open=project/:projectName',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
