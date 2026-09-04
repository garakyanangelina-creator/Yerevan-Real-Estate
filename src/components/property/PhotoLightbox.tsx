"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

interface Props {
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

export default function PhotoLightbox({ images, initialIndex = 0, title, onClose }: Props) {
  const [index, setIndex]   = useState(initialIndex);
  const [scale, setScale]   = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging]   = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const dragStart  = useRef<{ x: number; y: number } | null>(null);
  const offsetSnap = useRef({ x: 0, y: 0 });
  const pinchDist  = useRef<number | null>(null);
  const scaleSnap  = useRef(1);
  const overlayRef = useRef<HTMLDivElement>(null);

  const src = images[index];

  // Reset zoom/pan when image changes
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setImgLoaded(false);
  }, [index]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")       onClose();
      if (e.key === "ArrowRight")   go(1);
      if (e.key === "ArrowLeft")    go(-1);
      if (e.key === "+" || e.key === "=") zoom(0.4);
      if (e.key === "-")            zoom(-0.4);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length]);

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Fullscreen API
  useEffect(() => {
    function onFSChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  function go(dir: number) {
    setIndex((i) => (i + dir + images.length) % images.length);
  }

  function zoom(delta: number) {
    setScale((s) => {
      const next = Math.min(Math.max(s + delta, 1), 5);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  }

  function resetZoom() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  // Mouse wheel zoom
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 0.3 : -0.3);
  }

  // Mouse drag to pan
  function onMouseDown(e: React.MouseEvent) {
    if (scale <= 1) return;
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    offsetSnap.current = offset;
    setIsDragging(true);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragStart.current || !isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }

  function onMouseUp() {
    dragStart.current = null;
    setIsDragging(false);
  }

  // Touch: swipe left/right + pinch zoom
  function getTouchDist(e: React.TouchEvent) {
    const [a, b] = [e.touches[0], e.touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      pinchDist.current = getTouchDist(e);
      scaleSnap.current = scale;
      swipeStart.current = null;
    } else if (e.touches.length === 1) {
      swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (scale > 1) {
        dragStart.current = {
          x: e.touches[0].clientX - offset.x,
          y: e.touches[0].clientY - offset.y,
        };
      }
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchDist.current !== null) {
      const dist = getTouchDist(e);
      const ratio = dist / pinchDist.current;
      const next = Math.min(Math.max(scaleSnap.current * ratio, 1), 5);
      setScale(next);
      if (next === 1) setOffset({ x: 0, y: 0 });
      e.preventDefault();
    } else if (e.touches.length === 1 && scale > 1 && dragStart.current) {
      setOffset({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      });
      e.preventDefault();
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    pinchDist.current = null;
    dragStart.current = null;
    if (scale <= 1 && swipeStart.current && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - swipeStart.current.x;
      const dy = Math.abs(e.changedTouches[0].clientY - swipeStart.current.y);
      if (Math.abs(dx) > 60 && dy < 80) {
        go(dx < 0 ? 1 : -1);
      }
    }
    swipeStart.current = null;
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      overlayRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // Click overlay background (not image) → close
  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col bg-black/95 select-none"
      onClick={onOverlayClick}
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <div className="text-sm text-white/60">
          {title && <span className="mr-2 font-medium text-white">{title}</span>}
          <span>{index + 1} / {images.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => zoom(-0.4)}
            disabled={scale <= 1}
            aria-label="Zoom out"
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={() => zoom(0.4)}
            disabled={scale >= 5}
            aria-label="Zoom in"
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          {scale > 1 && (
            <button onClick={resetZoom} className="rounded-full px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white">
              Reset
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
      >
        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              aria-label="Previous"
              className="absolute left-3 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              aria-label="Next"
              className="absolute right-3 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Photo */}
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={src}
            src={src}
            alt={title ?? "Property photo"}
            onLoad={() => setImgLoaded(true)}
            draggable={false}
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              objectFit: "contain",
              display: "block",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          />
          {!imgLoaded && (
            <div style={{ width: "60vw", height: "40vh" }} className="flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="shrink-0 overflow-x-auto py-3">
          <div className="flex gap-2 px-4">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === index ? "border-gold-500 opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  draggable={false}
                  style={{ width: 80, height: 54, objectFit: "cover", display: "block" }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hint */}
      <p className="shrink-0 pb-3 text-center text-xs text-white/25">
        Scroll to zoom · Drag to pan · Arrow keys to navigate · Esc to close
      </p>
    </div>
  );
}
