import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: ['@fanzo/ui', '@fanzo/contracts'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.clerk.com' }],
  },
};

export default nextConfig;
