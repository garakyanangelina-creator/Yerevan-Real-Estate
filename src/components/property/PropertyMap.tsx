"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

export default function PropertyMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const [imgError, setImgError] = useState(false);

  const zoom = 15;
  const width = 800;
  const height = 300;
  const staticSrc = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lng},red-pushpin`;
  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  return (
    <div className="overflow-hidden rounded-xl shadow-soft">
      {!imgError ? (
        <a href={osmLink} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={staticSrc}
            alt={`Map showing location of ${title}`}
            className="h-72 w-full object-cover"
            onError={() => setImgError(true)}
          />
        </a>
      ) : (
        <a
          href={osmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-72 w-full flex-col items-center justify-center gap-3 bg-primary-50 text-primary-500 hover:bg-primary-100 dark:bg-primary-800/30 dark:text-white/60 dark:hover:bg-primary-800/50 transition-colors"
        >
          <MapPin className="h-8 w-8" />
          <span className="text-sm font-medium">View on OpenStreetMap</span>
        </a>
      )}
    </div>
  );
}
