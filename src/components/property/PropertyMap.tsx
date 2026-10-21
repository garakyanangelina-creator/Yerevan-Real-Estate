"use client";

import { MapPin } from "lucide-react";

function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  const px = (((lng + 180) / 360) * n - x) * 256;
  const py = (((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n - y) * 256;
  return { x, y, px, py };
}

export default function PropertyMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const zoom = 15;
  const { x, y, px, py } = latLngToTile(lat, lng, zoom);

  const cols = 5;
  const rows = 3;
  const tileSize = 256;

  // The pin sits at px,py within the center tile.
  // Offset the grid so that exact point lands at 50%,50% of the container.
  const centerCol = Math.floor(cols / 2);
  const centerRow = Math.floor(rows / 2);
  const shiftX = -(centerCol * tileSize + px);
  const shiftY = -(centerRow * tileSize + py);

  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  const tiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tx = x - centerCol + col;
      const ty = y - centerRow + row;
      const sub = ["a", "b", "c", "d"][(col + row) % 4];
      tiles.push({ key: `${tx}-${ty}`, src: `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tx}/${ty}.png`, col, row });
    }
  }

  return (
    <a
      href={osmLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl shadow-soft"
      title={`View ${title} on OpenStreetMap`}
    >
      <div className="relative bg-primary-100 dark:bg-primary-800" style={{ width: "100%", height: 288, overflow: "hidden" }}>
        {/* Tile grid — shifted so the exact location is at container center */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: cols * tileSize,
            height: rows * tileSize,
            transform: `translate(${shiftX}px, ${shiftY}px)`,
          }}
        >
          {tiles.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={t.key}
              src={t.src}
              alt=""
              width={tileSize}
              height={tileSize}
              style={{ position: "absolute", left: t.col * tileSize, top: t.row * tileSize }}
              draggable={false}
            />
          ))}
        </div>

        {/* Pin always at exact center */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <div className="rounded-full bg-red-500 p-1 shadow-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="h-2 w-0.5 bg-red-500" />
        </div>

        {/* OSM attribution */}
        <div className="absolute bottom-1 right-1 z-10 rounded bg-white/80 px-1 text-[10px] text-gray-600 dark:bg-black/50 dark:text-gray-300">
          ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            OpenStreetMap
          </a>
        </div>
      </div>
    </a>
  );
}
