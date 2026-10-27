'use client';
import { ArrowIcon } from '@/components/ArrowIcon';

import { useId, useRef, useState, useSyncExternalStore } from 'react';
import type { Gallery as GalleryContent } from '@/content/types';
import { Photo } from './Photo';
// Keep server-rendered controls inactive until their event handlers are attached.
const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
export function Gallery({
  gallery,
  initialLimit,
  sizes = '(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 40vw',
}: {
  gallery: GalleryContent;
  initialLimit?: number;
  sizes?: string;
}) {
  const galleryId = useId();
  const [expanded, setExpanded] = useState(false);
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const move = (offset: number) =>
    setIndex(
      (current) =>
        (current + offset + gallery.images.length) % gallery.images.length,
    );
  if (!gallery.images.length) return null;
  const selectedIndex = Math.min(index, gallery.images.length - 1);
  const selected = gallery.images[selectedIndex];
  const canExpand =
    initialLimit !== undefined && gallery.images.length > initialLimit;
  const visibleImages =
    canExpand && !expanded
      ? gallery.images.slice(0, initialLimit)
      : gallery.images;
  return (
    <>
      <div
        id={galleryId}
        className={`gallery gallery-count-${visibleImages.length}`}
      >
        {visibleImages.map((image, n) => (
          <figure key={image.id}>
            <button
              className="gallery-open"
              disabled={!hydrated}
              aria-label={`View photograph ${n + 1}: ${image.alt || gallery.title}`}
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setIndex(n);
                setIsOpen(true);
                dialog.current?.showModal();
              }}
            >
              <Photo image={image} natural sizes={sizes} />
              <span className="gallery-zoom" aria-hidden="true">
                View photograph <ArrowIcon direction="up-right" />
              </span>
            </button>
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {canExpand && (
        <div className="gallery-toggle">
          <button
            type="button"
            className="button"
            disabled={!hydrated}
            aria-expanded={expanded}
            aria-controls={galleryId}
            onClick={(event) => {
              const button = event.currentTarget;
              setExpanded(!expanded);
              if (expanded) {
                requestAnimationFrame(() => {
                  button.focus({ preventScroll: true });
                  button.scrollIntoView({
                    block: 'nearest',
                    behavior: 'instant',
                  });
                });
              }
            }}
          >
            {expanded ? 'Show fewer photos' : 'Show more photos'}
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`${gallery.title} — enlarged photograph`}
        onClose={() => {
          setIsOpen(false);
          trigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            move(1);
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        <div
          className="lightbox-content"
          onTouchStart={(e) => {
            const t = e.touches[0];
            touchStart.current = { x: t.clientX, y: t.clientY };
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - start.x,
              dy = t.clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
              move(dx < 0 ? 1 : -1);
          }}
        >
          <button
            autoFocus
            className="lightbox-close"
            onClick={() => dialog.current?.close()}
            aria-label="Close photograph"
          >
            Close ×
          </button>
          {isOpen && (
            <Photo
              image={selected}
              sizes="(max-width: 800px) 94vw, 85vw"
              priority
            />
          )}
          <div className="lightbox-controls">
            <button
              disabled={gallery.images.length < 2}
              onClick={() => move(-1)}
              aria-label="Previous photograph"
            >
              <ArrowIcon direction="left" /> Previous
            </button>
            <p aria-live="polite">
              {selectedIndex + 1} / {gallery.images.length}
              {selected.caption ? ` — ${selected.caption}` : ''}
            </p>
            <button
              disabled={gallery.images.length < 2}
              onClick={() => move(1)}
              aria-label="Next photograph"
            >
              Next <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
