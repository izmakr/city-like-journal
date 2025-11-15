import bundleAnalyzer from '@next/bundle-analyzer';
import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
  },
});

const nextConfig: NextConfig = {
  trailingSlash: true,
};

export default withBundleAnalyzer(withPWA(nextConfig));
