import type { RefObject } from "react";

const CANVAS_SIZE = 512;

interface ColorWheelProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  wheelRef: RefObject<HTMLDivElement>;
  cursorLeft: string;
  cursorTop: string;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
}

export function ColorWheel({
  canvasRef,
  wheelRef,
  cursorLeft,
  cursorTop,
  onPointerDown,
  onPointerMove,
  onDoubleClick,
}: ColorWheelProps) {
  return (
    <div
      ref={wheelRef}
      className="relative w-full aspect-square cursor-crosshair touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={onDoubleClick}
    >
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full h-full" />
      <div
        className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          left: cursorLeft,
          top: cursorTop,
          boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}
