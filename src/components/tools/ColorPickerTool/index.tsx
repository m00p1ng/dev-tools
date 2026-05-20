import { useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ToolSidebarLayout, ToolSidebar } from "@/components/ui/tool-layout";
import {
  type Hsv, type Rgb,
  hsvToHex,
  formatHex, formatRgb, formatHsl, formatHsv, formatOklch,
  parseHex, parseRgb, parseHsl, parseHsvStr, parseOklch,
  rgbToHsv,
} from "@/lib/tool-logic/color";
import { useColorWheel } from "./useColorWheel";
import { useDragSlider } from "./useDragSlider";
import { ColorWheel } from "./ColorWheel";
import { ColorSlider } from "./ColorSlider";
import { SavedColors } from "./SavedColors";
import { FormatRow } from "./FormatRow";

const SAVED_SLOTS = 16;

export function ColorPickerTool() {
  const [hsv, setHsv] = useLocalStorage<Hsv>("tool:color-picker", { h: 210, s: 75, v: 90, a: 100 });
  const [rawSavedColors, setSavedColors] = useLocalStorage<(string | null)[]>(
    "tool:color-picker:saved",
    Array(SAVED_SLOTS).fill(null),
  );
  const savedColors = rawSavedColors.length >= SAVED_SLOTS
    ? rawSavedColors
    : [...rawSavedColors, ...Array(SAVED_SLOTS - rawSavedColors.length).fill(null)];

  const wheelRef = useRef<HTMLDivElement>(null);
  const brightnessRef = useRef<HTMLDivElement>(null);
  const opacityRef = useRef<HTMLDivElement>(null);

  const { canvasRef, ...wheelHandlers } = useColorWheel(wheelRef, hsv, setHsv, savedColors, setSavedColors);
  const brightness = useDragSlider(brightnessRef, (pct) => setHsv({ ...hsv, v: pct }));
  const opacity = useDragSlider(opacityRef, (pct) => setHsv({ ...hsv, a: pct }));

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
        <ColorWheel
          canvasRef={canvasRef}
          wheelRef={wheelRef}
          cursorLeft={wheelHandlers.cursorLeft}
          cursorTop={wheelHandlers.cursorTop}
          onPointerDown={wheelHandlers.onPointerDown}
          onPointerMove={wheelHandlers.onPointerMove}
          onDoubleClick={wheelHandlers.onDoubleClick}
        />
        <ColorSlider
          value={hsv.v}
          containerStyle={{ background: `linear-gradient(to right, #000, ${pureHueHex})` }}
          thumbColor={hexColor}
          sliderRef={brightnessRef}
          onPointerDown={brightness.onPointerDown}
          onPointerMove={brightness.onPointerMove}
        />
        <ColorSlider
          value={hsv.a ?? 100}
          containerStyle={{
            backgroundImage: `linear-gradient(to right, transparent, ${hexColor}), repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%)`,
            backgroundSize: "100% 100%, 10px 10px",
          }}
          thumbColor={hexColor}
          sliderRef={opacityRef}
          onPointerDown={opacity.onPointerDown}
          onPointerMove={opacity.onPointerMove}
        />
        <SavedColors
          hsv={hsv}
          savedColors={savedColors}
          setSavedColors={setSavedColors}
          setHsv={setHsv}
        />
      </ToolSidebar>
      <div className="flex flex-col gap-2 min-h-0 overflow-auto flex-1 min-w-0">
        <FormatRow label="HEX"   value={formatHex(hsv)}   onCommit={commitWith(parseHex)} />
        <FormatRow label="RGB"   value={formatRgb(hsv)}   onCommit={commitWith(parseRgb)} />
        <FormatRow label="HSL"   value={formatHsl(hsv)}   onCommit={commitWith(parseHsl)} />
        <FormatRow label="HSV"   value={formatHsv(hsv)}   onCommit={commitHsv} />
        <FormatRow label="OKLCH" value={formatOklch(hsv)} onCommit={commitWith(parseOklch)} />
      </div>
    </ToolSidebarLayout>
  );
}
