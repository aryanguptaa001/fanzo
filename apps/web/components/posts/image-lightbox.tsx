'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { RefObject, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { PostMedia } from '../../lib/creator';

type ImageLightboxProps = {
  images: PostMedia[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

export function ImageLightbox({
  images,
  index,
  onChange,
  onClose,
  returnFocusRef,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const image = images[index];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const returnFocusElement = returnFocusRef.current;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusElement?.focus();
    };
  }, [returnFocusRef]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && images.length > 1) {
        onChange((index - 1 + images.length) % images.length);
      }
      if (event.key === 'ArrowRight' && images.length > 1) {
        onChange((index + 1) % images.length);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, index, onChange, onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-8"
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:right-6 sm:top-6"
      >
        <X className="h-6 w-6" />
      </button>
      {images.length > 1 ? (
        <button
          type="button"
          onClick={() => onChange((index - 1 + images.length) % images.length)}
          aria-label="Previous image"
          className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:left-6"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      ) : null}
      {/* MinIO hosts are environment-configurable, so the lightbox deliberately avoids a static Next Image allowlist. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={`Image ${index + 1} of ${images.length}`}
        className="max-h-[calc(100vh-5rem)] max-w-[calc(100vw-1.5rem)] object-contain sm:max-w-[calc(100vw-8rem)]"
      />
      {images.length > 1 ? (
        <button
          type="button"
          onClick={() => onChange((index + 1) % images.length)}
          aria-label="Next image"
          className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:right-6"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      ) : null}
      <p className="absolute bottom-3 rounded-full bg-black/50 px-3 py-1.5 text-sm font-semibold text-white sm:bottom-6">
        {index + 1} / {images.length}
      </p>
    </div>,
    document.body,
  );
}
