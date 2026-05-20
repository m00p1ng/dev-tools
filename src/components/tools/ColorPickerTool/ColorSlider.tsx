import type { CSSProperties, RefObject } from "react";

interface ColorSliderProps {
  value: number;
  containerStyle: CSSProperties;
  thumbColor: string;
  sliderRef: RefObject<HTMLDivElement>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function ColorSlider({
  value,
  containerStyle,
  thumbColor,
  sliderRef,
  onPointerDown,
  onPointerMove,
}: ColorSliderProps) {
  return (
    <div
      ref={sliderRef}
      className="relative h-5 w-full rounded-full cursor-pointer select-none touch-none overflow-hidden"
      style={containerStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <div
        className="absolute top-1/2 w-5 h-5 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-[background-color] duration-150"
        style={{
          left: `calc(clamp(10px, ${value}%, 100% - 10px))`,
          background: thumbColor,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}
