import { useEffect, useRef, useState } from "react";

const clampZoom = (z: number) => Math.min(10, Math.max(0.25, z));

function getTouchDist(
  t1: { clientX: number; clientY: number },
  t2: { clientX: number; clientY: number }
) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

interface Viewport {
  zoom: number;
  pan: { x: number; y: number };
}

const RESET_VIEWPORT: Viewport = { zoom: 1, pan: { x: 0, y: 0 } };

export function useDiagramViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>(RESET_VIEWPORT);

  // Mirror into ref so native event handlers always read current values
  const viewportRef = useRef(viewport);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const pinchRef = useRef<{
    dist: number;
    startZoom: number;
    startPan: { x: number; y: number };
    midX: number;
    midY: number;
  } | null>(null);

  const fitToScreen = () => {
    const el = containerRef.current;
    if (!el) return;
    const svgEl = el.querySelector("svg[aria-roledescription]") as SVGSVGElement | null;
    if (!svgEl) { setViewport(RESET_VIEWPORT); return; }
    const containerW = el.clientWidth;
    const containerH = el.clientHeight;
    const vb = svgEl.viewBox?.baseVal;
    // Mermaid SVGs use width="100%" so clientWidth gives the actual CSS-rendered width.
    // height="100%" is unreliable — derive from viewBox aspect ratio instead.
    const cssW = svgEl.clientWidth;
    const cssH = (cssW && vb?.width && vb?.height)
      ? cssW * (vb.height / vb.width)
      : svgEl.clientHeight;
    if (!cssW || !cssH || !containerW || !containerH) { setViewport(RESET_VIEWPORT); return; }
    setViewport({
      zoom: clampZoom(Math.min(containerW / cssW, containerH / cssH) * 0.9),
      pan: { x: 0, y: 0 },
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      const { zoom: z, pan: p } = viewportRef.current;

      if (e.ctrlKey || e.metaKey) {
        const newZoom = clampZoom(z * (1 - e.deltaY * 0.004));
        const ratio = newZoom / z;
        setViewport({ zoom: newZoom, pan: { x: cx + (p.x - cx) * ratio, y: cy + (p.y - cy) * ratio } });
      } else if (e.shiftKey) {
        setViewport({ zoom: z, pan: { x: p.x - e.deltaY, y: p.y } });
      } else {
        setViewport({ zoom: z, pan: { x: p.x - e.deltaX, y: p.y - e.deltaY } });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const t1 = e.touches[0], t2 = e.touches[1];
      const { dist, startZoom, startPan, midX, midY } = pinchRef.current;
      const newZoom = clampZoom(startZoom * (getTouchDist(t1, t2) / dist));
      const ratio = newZoom / startZoom;
      setViewport({
        zoom: newZoom,
        pan: { x: midX + (startPan.x - midX) * ratio, y: midY + (startPan.y - midY) * ratio },
      });
    };

    // passive: false + capture: true — preventDefault before mermaid child listeners consume the event
    el.addEventListener("wheel", onWheel, { passive: false, capture: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    return () => {
      el.removeEventListener("wheel", onWheel, { capture: true });
      el.removeEventListener("touchmove", onTouchMove, { capture: true });
    };
  }, []);

  const handlers = {
    onMouseDown(e: React.MouseEvent) {
      if (e.button !== 0) return;
      containerRef.current!.style.cursor = "grabbing";
      const { pan } = viewportRef.current;
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    },
    onMouseMove(e: React.MouseEvent) {
      if (!dragRef.current) return;
      const { panX, panY, startX, startY } = dragRef.current;
      setViewport(v => ({
        zoom: v.zoom,
        pan: { x: panX + e.clientX - startX, y: panY + e.clientY - startY },
      }));
    },
    onMouseUp() {
      containerRef.current!.style.cursor = "grab";
      dragRef.current = null;
    },
    onMouseLeave() {
      containerRef.current!.style.cursor = "grab";
      dragRef.current = null;
    },
    onTouchStart(e: React.TouchEvent) {
      if (e.touches.length !== 2) return;
      const t1 = e.touches[0], t2 = e.touches[1];
      const rect = containerRef.current!.getBoundingClientRect();
      pinchRef.current = {
        dist: getTouchDist(t1, t2),
        startZoom: viewportRef.current.zoom,
        startPan: { ...viewportRef.current.pan },
        midX: (t1.clientX + t2.clientX) / 2 - rect.left - rect.width / 2,
        midY: (t1.clientY + t2.clientY) / 2 - rect.top - rect.height / 2,
      };
    },
    onTouchEnd() { pinchRef.current = null; },
  };

  return {
    containerRef,
    zoom: viewport.zoom,
    pan: viewport.pan,
    fitToScreen,
    zoomIn: () => setViewport(v => ({ ...v, zoom: clampZoom(v.zoom + 0.1) })),
    zoomOut: () => setViewport(v => ({ ...v, zoom: clampZoom(v.zoom - 0.1) })),
    setZoomPreset: (z: number) => setViewport({ zoom: z, pan: { x: 0, y: 0 } }),
    handlers,
  };
}
