import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { legacyResponse } from '@/lib/legacy';
export function proxy(request: NextRequest) {
  return (
    legacyResponse(request, process.env.SITE_MODE === 'production') ||
    NextResponse.next()
  );
}
export const config = {
  matcher: [
    '/about-us/:path*',
    '/contact/:path*',
    '/testimonials/:path*',
    '/price/:path*',
    '/blog/:path*',
    '/client-guides',
    '/portfolio/:path*',
    '/Portfolio/:path*',
    '/prices/:path*',
    '/post/:path*',
    '/rte-styling',
    '/style-guide',
  ],
};
