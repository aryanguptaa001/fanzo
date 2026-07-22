'use client';

import { useCallback, useRef, useState } from 'react';
import type { PostMedia } from '../../lib/creator';
import { ImageLightbox } from './image-lightbox';

export function MediaGallery({ media }: { media: PostMedia[] }) {
  const images = media.filter((item) => item.type === 'IMAGE');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const closeLightbox = useCallback(() => setSelectedImage(null), []);
  if (!media.length) return null;
  const layout = media.length === 1 ? 'grid-cols-1' : 'grid-cols-2';
  return (
    <div className={`mt-4 grid ${layout} gap-1 overflow-hidden rounded-2xl bg-zinc-100`}>
      {media.map((item, index) => (
        <div
          key={item.id}
          className={`relative bg-zinc-950 ${media.length === 1 ? 'aspect-[4/3]' : 'aspect-square'} ${media.length === 3 && index === 0 ? 'row-span-2 aspect-auto' : ''}`}
        >
          {item.type === 'VIDEO' ? (
            <video
              src={item.url}
              controls
              preload="metadata"
              className="h-full w-full object-contain"
            >
              Your browser does not support this video.
            </video>
          ) : (
            <button
              type="button"
              aria-label={`Open image ${images.findIndex((image) => image.id === item.id) + 1} of ${images.length}`}
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setSelectedImage(images.findIndex((image) => image.id === item.id));
              }}
              className="h-full w-full cursor-pointer focus:outline-none focus:ring-4 focus:ring-inset focus:ring-violet-400"
            >
              {/* Public media can come from a configurable S3-compatible host, so Next Image host allowlists are not appropriate here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt="Post media"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          )}
        </div>
      ))}
      {selectedImage !== null ? (
        <ImageLightbox
          images={images}
          index={selectedImage}
          onChange={setSelectedImage}
          onClose={closeLightbox}
          returnFocusRef={returnFocusRef}
        />
      ) : null}
    </div>
  );
}
