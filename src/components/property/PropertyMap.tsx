export default function PropertyMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const delta = 0.006;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="overflow-hidden rounded-xl2 shadow-soft">
      <iframe
        title={`Map showing location of ${title}`}
        src={src}
        className="h-72 w-full border-0"
        loading="lazy"
      />
    </div>
  );
}
