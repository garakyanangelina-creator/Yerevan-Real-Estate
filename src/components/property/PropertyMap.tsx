"use client";

import { MapPin } from "lucide-react";

// Convert lat/lng to OSM tile coordinates at given zoom
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

// Pixel offset of the exact lat/lng within the center tile (0–256)
function latLngToPixelOffset(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const xFloat = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yFloat = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return {
    px: (xFloat - Math.floor(xFloat)) * 256,
    py: (yFloat - Math.floor(yFloat)) * 256,
  };
}

export default function PropertyMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const zoom = 15;
  const { x, y } = latLngToTile(lat, lng, zoom);
  const { px, py } = latLngToPixelOffset(lat, lng, zoom);

  // Show a 3×2 grid of tiles (768×512 visible area, cropped to show the pin centered)
  const cols = 3;
  const rows = 2;
  const tileSize = 256;
  const mapW = cols * tileSize;
  const mapH = rows * tileSize;

  // Center the pin at 50% width, 50% height of the visible area
  const offsetX = Math.round(mapW / 2 - px);
  const offsetY = Math.round(mapH / 2 - py);

  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

  const tiles: { key: string; src: string; left: number; top: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tx = x - Math.floor(cols / 2) + col;
      const ty = y - Math.floor(rows / 2) + row;
      // Round-robin between OSM tile subdomains for better performance
      const sub = ["a", "b", "c"][(col + row) % 3];
      tiles.push({
        key: `${tx}-${ty}`,
        src: `https://${sub}.tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`,
        left: offsetX + col * tileSize,
        top: offsetY + row * tileSize,
      });
    }
  }

  // Pin position relative to the container (always center)
  const pinLeft = mapW / 2;
  const pinTop = mapH / 2;

  return (
    <a
      href={osmLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl shadow-soft"
      title={`View ${title} on OpenStreetMap`}
    >
      <div
        className="relative bg-primary-100 dark:bg-primary-800"
        style={{ width: "100%", height: 288, overflow: "hidden" }}
      >
        {/* Tile layer */}
        <div className="absolute inset-0" style={{ width: mapW, height: mapH, overflow: "visible" }}>
          {tiles.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={t.key}
              src={t.src}
              alt=""
              width={tileSize}
              height={tileSize}
              style={{ position: "absolute", left: t.left, top: t.top, imageRendering: "auto" }}
              draggable={false}
            />
          ))}
        </div>

        {/* Pin marker */}
        <div
          className="absolute z-10 flex flex-col items-center"
          style={{ left: pinLeft, top: pinTop, transform: "translate(-50%, -100%)" }}
        >
          <div className="rounded-full bg-red-500 p-1 shadow-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="h-2 w-0.5 bg-red-500" />
        </div>

        {/* OSM attribution */}
        <div className="absolute bottom-1 right-1 z-10 rounded bg-white/80 px-1 text-[10px] text-gray-600 dark:bg-black/50 dark:text-gray-300">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>OpenStreetMap</a>
        </div>
      </div>
    </a>
  );
}
