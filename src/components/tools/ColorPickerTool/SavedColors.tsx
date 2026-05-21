import { useState } from "react";
import { Pipette } from "lucide-react";
import type { Hsv } from "@/lib/tool-logic/color";
import { formatHex, formatRgb, parseHex, rgbToHsv } from "@/lib/tool-logic/color";
import { cn } from "@/lib/utils";

interface SavedColorsProps {
  hsv: Hsv;
  savedColors: (string | null)[];
  setSavedColors: (c: (string | null)[]) => void;
  setHsv: (hsv: Hsv) => void;
}

type EyeDropperConstructor = new () => {
  open: () => Promise<{ sRGBHex: string }>;
};

export function SavedColors({ hsv, savedColors, setSavedColors, setHsv }: SavedColorsProps) {
  const [hasEyeDropper] = useState(() => "EyeDropper" in window);
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null);

  const handleSlotClick = (i: number) => {
    const color = savedColors[i];
    if (color) {
      const rgb = parseHex(color);
      if (rgb) setHsv(rgbToHsv(rgb));
    } else {
      const next = [...savedColors];
      next[i] = formatHex(hsv);
      setSavedColors(next);
      setAnimatingSlot(i);
      setTimeout(() => setAnimatingSlot(null), 350);
    }
  };

  const handleSlotClear = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    const next = [...savedColors];
    next[i] = null;
    setSavedColors(next);
  };

  const handleEyeDropper = async () => {
    try {
      const EyeDropper = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
      if (!EyeDropper) return;
      const { sRGBHex } = await new EyeDropper().open();
      const rgb = parseHex(sRGBHex);
      if (rgb) setHsv(rgbToHsv(rgb));
    } catch {
      return;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-10 h-10 shrink-0 rounded-md border border-border overflow-hidden"
        style={{ background: "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px" }}
      >
        <div className="w-full h-full transition-[background] duration-200" style={{ background: formatRgb(hsv) }} />
      </div>
      {hasEyeDropper && (
        <button
          onClick={handleEyeDropper}
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          title="Pick color from screen"
        >
          <Pipette className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="grid grid-cols-8 gap-1 flex-1">
        {savedColors.map((color, i) => (
          <div
            key={i}
            onClick={() => handleSlotClick(i)}
            onContextMenu={(e) => handleSlotClear(e, i)}
            title={color ? `${color} — click to load, right-click to clear` : "Click to save current color"}
            className={cn(
              "w-6 h-6 rounded border cursor-pointer overflow-hidden transition-all duration-200 active:scale-90",
              animatingSlot === i && "scale-125",
              color
                ? "border-border hover:ring-1 hover:ring-ring"
                : "border-dashed border-muted-foreground/70 bg-muted/40 hover:bg-muted hover:border-muted-foreground",
            )}
            style={color ? {
              backgroundImage: `linear-gradient(${color}, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)`,
              backgroundSize: "100% 100%, 6px 6px",
            } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
