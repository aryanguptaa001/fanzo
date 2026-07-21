import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import { resolve } from 'node:path';

loadEnvConfig(
  resolve(process.cwd(), '../..'),
  process.env.NODE_ENV !== 'production',
  console,
  true,
);

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: ['@fanzo/ui', '@fanzo/contracts'],
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.clerk.com' }],
  },
};

export default nextConfig;
