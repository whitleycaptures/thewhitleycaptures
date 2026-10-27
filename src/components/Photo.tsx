'use client';
import Image, { type ImageLoaderProps } from 'next/image';
function sanityLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality || 80));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'max');
  return url.href;
}
// Hero and enlarged images receive extra detail; thumbnails use smaller files.
// Distinct URLs also avoid Next's src-keyed LCP tracking confusing duplicate images.
function detailedSanityLoader(props: ImageLoaderProps) {
  return sanityLoader({ ...props, quality: 85 });
}
import type { ContentImage } from '@/content/types';
import { imageStyle } from '@/content/images';
export function Photo({
  image,
  className = '',
  sizes = '100vw',
  priority = false,
  natural = false,
  onLoad,
}: {
  image: ContentImage | null | undefined;
  className?: string;
  sizes?: string;
  priority?: boolean;
  natural?: boolean;
  onLoad?: () => void;
}) {
  if (!image?.src || !image.width || !image.height)
    return (
      <div
        className={`photo-placeholder ${className}`}
        role="img"
        aria-label="Photograph not selected yet"
      />
    );
  if (image.src.startsWith('https://cdn.sanity.io/')) {
    // The production vinext custom-loader branch does not generate srcset.
    const widths = [
      ...new Set([
        320,
        480,
        640,
        750,
        828,
        1080,
        1200,
        1600,
        1920,
        image.width,
      ]),
    ]
      .filter((width) => width <= image.width)
      .sort((a, b) => a - b);
    const loader = priority ? detailedSanityLoader : sanityLoader;
    const source = (width: number) =>
      loader({ src: image.src, width, quality: 80 });
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Sanity supplies responsive optimisation.
      <img
        src={source(Math.min(image.width, 1200))}
        srcSet={widths.map((width) => `${source(width)} ${width}w`).join(', ')}
        sizes={sizes}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
        onLoad={onLoad}
        style={{
          ...imageStyle(image),
          ...(natural
            ? { aspectRatio: `${image.width} / ${image.height}` }
            : {}),
        }}
      />
    );
  }
  return (
    <Image
      onLoad={onLoad}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      className={className}
      style={{
        ...imageStyle(image),
        ...(natural ? { aspectRatio: `${image.width} / ${image.height}` } : {}),
      }}
    />
  );
}
