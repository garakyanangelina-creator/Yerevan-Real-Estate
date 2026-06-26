"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const gallery = images.length > 0 ? images : ["/images/placeholder-property.svg"];
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  function next() {
    setActive((i) => (i + 1) % gallery.length);
  }
  function prev() {
    setActive((i) => (i - 1 + gallery.length) % gallery.length);
  }

  return (
    <div>
      <div className="relative h-[420px] w-full overflow-hidden rounded-xl2">
        <Image
          src={gallery[active]}
          alt={`${title} photo ${active + 1}`}
          fill
          priority
          unoptimized
          className="object-cover"
        />
        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => setFullscreen(true)}
          aria-label="Fullscreen"
          className="absolute right-3 top-3 rounded-full bg-white/80 p-2 hover:bg-white"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto">
        {gallery.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActive(i)}
            className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
              i === active ? "border-gold-500" : "border-transparent"
            }`}
          >
            <Image src={src} alt="" fill unoptimized className="object-cover" />
          </button>
        ))}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 text-white">
            <ChevronLeft className="h-8 w-8" />
          </button>
          <div className="relative h-[80vh] w-[80vw]">
            <Image src={gallery[active]} alt="" fill unoptimized className="object-contain" />
          </div>
          <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 text-white">
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  );
}
