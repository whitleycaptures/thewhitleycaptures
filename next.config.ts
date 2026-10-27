import type { NextConfig } from 'next';
import { networkInterfaces } from 'node:os';
import { securityHeaders } from './src/lib/security';
const config: NextConfig = {
  poweredByHeader: false,
  // Canonical signals must be present in the initial head, including cached HTML.
  htmlLimitedBots: /.*/,
  // Permit only this computer's own addresses for same-Wi-Fi phone review.
  allowedDevOrigins: Object.values(networkInterfaces())
    .flat()
    .filter((entry) => entry?.family === 'IPv4')
    .map((entry) => entry!.address),
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' },
    ],
  },
  async headers() {
    const indexingHeaders =
      process.env.SITE_MODE === 'production'
        ? [
            {
              source: '/studio/:path*',
              headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
            {
              source: '/api/:path*',
              headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
          ]
        : [
            {
              source: '/:path*',
              headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
          ];
    return [
      { source: '/:path*', headers: securityHeaders },
      ...indexingHeaders,
    ];
  },
};
export default config;
