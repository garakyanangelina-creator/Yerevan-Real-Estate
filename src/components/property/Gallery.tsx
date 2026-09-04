"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import PhotoLightbox from "./PhotoLightbox";

interface Props {
  images: string[];
  title: string;
}

export default function Gallery({ images, title }: Props) {
  const gallery = images.length > 0 ? images : ["/images/placeholder-property.svg"];
  const [active, setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);

  function prev(e?: React.MouseEvent) { e?.stopPropagation(); setActive((i) => (i - 1 + gallery.length) % gallery.length); }
  function next(e?: React.MouseEvent) { e?.stopPropagation(); setActive((i) => (i + 1) % gallery.length); }

  return (
    <>
      {/* Main photo */}
      <div className="overflow-hidden rounded-2xl bg-primary-900">
        {/* 16:9 container — object-contain so full room is always visible */}
        <div
          className="relative w-full cursor-zoom-in"
          style={{ aspectRatio: "16/9", maxHeight: 520 }}
          onClick={() => setLightbox(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={active}
            src={gallery[active]}
            alt={`${title} — photo ${active + 1}`}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "contain",          // full room, no cropping
              display: "block",
            }}
          />

          {/* Prev / Next */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Expand hint + counter */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {gallery.length > 1 && (
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                {active + 1} / {gallery.length}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
              aria-label="View fullscreen"
              className="rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            >
              <Expand className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
                className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === active ? "border-gold-500 opacity-100" : "border-transparent opacity-55 hover:opacity-90"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  style={{ width: 96, height: 64, objectFit: "cover", display: "block" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <PhotoLightbox
          images={gallery}
          initialIndex={active}
          title={title}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}
