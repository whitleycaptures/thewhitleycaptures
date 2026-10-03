import { draftMode } from 'next/headers';
import {
  getPortfolio,
  getArticles,
  getHomepage,
  getAboutPage,
} from '@/content';
import type { ContentImage } from '@/content/types';
import { isProduction, siteUrl } from '@/lib/seo';
export async function GET() {
  if (!isProduction || (await draftMode()).isEnabled)
    return new Response('Sitemap is disabled for this preview.', {
      status: 404,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'private, no-store',
      },
    });
  const [services, articles, home, about] = await Promise.all([
    getPortfolio(),
    getArticles(),
    getHomepage(),
    getAboutPage(),
  ]);
  // Only associate images actually displayed on each published page.
  const pages: { path: string; images: (ContentImage | undefined)[] }[] = [
    {
      path: '/',
      images: [
        ...(home.hero.images?.length
          ? home.hero.images.slice(0, 3)
          : [home.hero.image]),
        home.introduction.image,
        ...home.services.items.map((s) => s.cardImage || s.hero),
        ...(home.awards?.articleSlug ? [home.awards.image] : []),
      ],
    },
    ...(about ? [{ path: '/about-me', images: [about.portrait] }] : []),
    { path: '/privacy-policy', images: [] },
    { path: '/client-guides', images: [] },
    ...articles.map((a) => ({
      path: `/post/${a.slug}`,
      images: a.blocks
        .filter((b) => b.kind === 'gallery')
        .flatMap((b) => b.images || []),
    })),
    ...services.map((s) => ({
      path: `/prices/${s.slug}`,
      images: [s.hero, ...(s.gallery?.images || [])],
    })),
  ];
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const entries = pages.map(({ path, images }) => {
    const urls = [
      ...new Set(
        images
          .filter((image) => image?.src && image.width && image.height)
          .map((image) => new URL(image!.src, siteUrl).href),
      ),
    ].slice(0, 1000);
    return `<url><loc>${escape(new URL(path, siteUrl).href)}</loc>${urls.map((url) => `<image:image><image:loc>${escape(url)}</image:loc></image:image>`).join('')}</url>`;
  });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
