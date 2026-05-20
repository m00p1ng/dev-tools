import { useRef, useCallback, useEffect, type RefObject } from "react";
import type { Hsv } from "@/lib/tool-logic/color";
import { formatHex } from "@/lib/tool-logic/color";

const CANVAS_SIZE = 512;
const RADIUS = CANVAS_SIZE / 2 - 1;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;

// Inline fast HSV→RGB for canvas pixel loop (avoids colord overhead)
function hsvToRgbFast(h: number, s: number, v: number): [number, number, number] {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function useColorWheel(
  wheelRef: RefObject<HTMLDivElement>,
  hsv: Hsv,
  setHsv: (hsv: Hsv) => void,
  savedColors: (string | null)[],
  setSavedColors: (c: (string | null)[]) => void,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;
    for (let y = 0; y < CANVAS_SIZE; y++) {
      for (let x = 0; x < CANVAS_SIZE; x++) {
        const dx = x - CX, dy = y - CY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > RADIUS + 1) continue;
        const idx = (y * CANVAS_SIZE + x) * 4;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        const sat = Math.min(100, (dist / RADIUS) * 100);
        const [r, g, b] = hsvToRgbFast(angle, sat, hsv.v);
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b;
        data[idx + 3] = dist > RADIUS ? Math.round((RADIUS + 1 - dist) * 255) : 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [hsv.v]);

  const pickFromWheel = useCallback((clientX: number, clientY: number) => {
    const el = wheelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const halfW = rect.width / 2, halfH = rect.height / 2;
    const dx = clientX - rect.left - halfW;
    const dy = clientY - rect.top - halfH;
    const maxRadius = Math.min(halfW, halfH);
    const dist = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    setHsv({ ...hsv, h: Math.round(angle), s: Math.min(100, Math.round((dist / maxRadius) * 100)) });
  }, [hsv, setHsv, wheelRef]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pickFromWheel(e.clientX, e.clientY);
  }, [pickFromWheel]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.buttons) return;
    pickFromWheel(e.clientX, e.clientY);
  }, [pickFromWheel]);

  const onDoubleClick = useCallback(() => {
    const idx = savedColors.findIndex((c) => !c);
    if (idx === -1) return;
    const next = [...savedColors];
    next[idx] = formatHex(hsv);
    setSavedColors(next);
  }, [savedColors, hsv, setSavedColors]);

  const angleRad = hsv.h * Math.PI / 180;
  const cursorLeft = `${50 + (hsv.s / 100) * 50 * Math.cos(angleRad)}%`;
  const cursorTop = `${50 + (hsv.s / 100) * 50 * Math.sin(angleRad)}%`;

  return { canvasRef, onPointerDown, onPointerMove, onDoubleClick, cursorLeft, cursorTop };
}
