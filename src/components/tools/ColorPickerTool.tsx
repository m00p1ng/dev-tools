import { useRef, useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ToolSidebarLayout, ToolSidebar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import {
  type Hsv,
  type Rgb,
  formatHex, formatRgb, formatHsl, formatHsv, formatOklch,
  parseHex, parseRgb, parseHsl, parseHsvStr, parseOklch,
  hsvToHex, rgbToHsv,
} from "@/lib/tool-logic/color";

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

interface FormatRowProps {
  label: string;
  value: string;
  onCommit: (raw: string) => boolean;
}

function FormatRow({ label, value, onCommit }: FormatRowProps) {
  const [raw, setRaw] = useState(value);
  const [prev, setPrev] = useState(value);
  const [isError, setIsError] = useState(false);

  if (value !== prev) { setPrev(value); setRaw(value); setIsError(false); }

  const commit = () => setIsError(!onCommit(raw));

  return (
    <div className={cn("rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors", isError && "border-destructive")}>
      <div className="flex items-center justify-between mb-1.5">
        <Badge variant="outline" className="text-xs font-mono">{label}</Badge>
        <CopyButton text={value} />
      </div>
      <input
        className="w-full bg-transparent font-mono text-sm outline-none text-foreground"
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setIsError(false); }}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        spellCheck={false}
      />
    </div>
  );
}

export function ColorPickerTool() {
  const [hsv, setHsv] = useLocalStorage<Hsv>("tool:color-picker", { h: 210, s: 75, v: 90 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const brightnessRef = useRef<HTMLDivElement>(null);

  // Redraw wheel when brightness changes (hue/sat only move cursor, no redraw needed)
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

  // Wheel pointer handlers
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
  }, [hsv, setHsv]);

  const handleWheelDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pickFromWheel(e.clientX, e.clientY);
  }, [pickFromWheel]);

  const handleWheelMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.buttons) return;
    pickFromWheel(e.clientX, e.clientY);
  }, [pickFromWheel]);

  // Brightness slider handlers
  const pickBrightness = useCallback((clientX: number) => {
    const el = brightnessRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const v = Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    setHsv({ ...hsv, v });
  }, [hsv, setHsv]);

  const handleBrightnessDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pickBrightness(e.clientX);
  }, [pickBrightness]);

  const handleBrightnessMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.buttons) return;
    pickBrightness(e.clientX);
  }, [pickBrightness]);

  // Cursor position as % of container
  const angleRad = hsv.h * Math.PI / 180;
  const cursorLeft = `${50 + (hsv.s / 100) * 50 * Math.cos(angleRad)}%`;
  const cursorTop = `${50 + (hsv.s / 100) * 50 * Math.sin(angleRad)}%`;

  const hexColor = hsvToHex(hsv);
  const pureHueHex = hsvToHex({ h: hsv.h, s: 100, v: 100 });

  const commitWith = (parse: (s: string) => Rgb | null) => (raw: string) => {
    const result = parse(raw);
    if (!result) return false;
    setHsv(rgbToHsv(result));
    return true;
  };

  const commitHsv = (raw: string) => {
    const result = parseHsvStr(raw);
    if (!result) return false;
    setHsv(result);
    return true;
  };

  return (
    <ToolSidebarLayout>
      <ToolSidebar>
        {/* Color wheel */}
        <div
          ref={wheelRef}
          className="relative w-full aspect-square cursor-crosshair touch-none select-none"
          onPointerDown={handleWheelDown}
          onPointerMove={handleWheelMove}
        >
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full h-full" />
          {/* Crosshair cursor */}
          <div
            className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: cursorLeft,
              top: cursorTop,
              boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
            }}
          />
        </div>

        {/* Brightness slider */}
        <div
          ref={brightnessRef}
          className="relative h-5 w-full rounded-full cursor-pointer select-none touch-none overflow-hidden"
          style={{ background: `linear-gradient(to right, #000, ${pureHueHex})` }}
          onPointerDown={handleBrightnessDown}
          onPointerMove={handleBrightnessMove}
        >
          <div
            className="absolute top-1/2 w-5 h-5 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${hsv.v}%`,
              background: hexColor,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* Swatch */}
        <div className="w-full h-14 rounded-lg border border-border" style={{ background: hexColor }} />
      </ToolSidebar>

      {/* Format cards */}
      <div className="flex flex-col gap-2 min-h-0 overflow-auto">
        <FormatRow label="HEX"   value={formatHex(hsv)}   onCommit={commitWith(parseHex)} />
        <FormatRow label="RGB"   value={formatRgb(hsv)}   onCommit={commitWith(parseRgb)} />
        <FormatRow label="HSL"   value={formatHsl(hsv)}   onCommit={commitWith(parseHsl)} />
        <FormatRow label="HSV"   value={formatHsv(hsv)}   onCommit={commitHsv} />
        <FormatRow label="OKLCH" value={formatOklch(hsv)} onCommit={commitWith(parseOklch)} />
      </div>
    </ToolSidebarLayout>
  );
}
