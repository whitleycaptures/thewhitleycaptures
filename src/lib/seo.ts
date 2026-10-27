import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import type { Seo } from '@/content/types';
export const isProduction = process.env.SITE_MODE === 'production';
export const siteUrl = new URL(process.env.SITE_URL || 'http://localhost:3000');
export async function pageMetadata(
  content: Seo,
  path: string,
  defaults: Seo = content,
): Promise<Metadata> {
  const seo = {
    title: content?.title || defaults.title,
    description: content?.description || defaults.description,
    image: content?.image?.src ? content.image : defaults.image,
  };
  const indexable = isProduction && !(await draftMode()).isEnabled;
  return {
    title: {
      absolute: `${seo.title.replace(/(?:\s*\|\s*The Whitley Captures)+$/i, '').trim()} | The Whitley Captures`,
    },
    description: seo.description,
    alternates: { canonical: new URL(path, siteUrl).href },
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      siteName: 'The Whitley Captures',
      url: new URL(path, siteUrl).href,
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: new URL(seo.image.src, siteUrl).href,
          width: seo.image.width,
          height: seo.image.height,
          alt: seo.image.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [new URL(seo.image.src, siteUrl).href],
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
