import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MIN_DIMENSION = 1;
const MAX_DIMENSION = 5_000;
const SIZE_PRESETS = [
  { label: "Small · 320 × 200", width: 320, height: 200 },
  { label: "Normal · 640 × 400", width: 640, height: 400 },
  { label: "Standard · 800 × 600", width: 800, height: 600 },
  { label: "Square · 1080 × 1080", width: 1080, height: 1080 },
  { label: "Social · 1200 × 630", width: 1200, height: 630 },
  { label: "HD · 1280 × 720", width: 1280, height: 720 },
  { label: "Full HD · 1920 × 1080", width: 1920, height: 1080 },
  { label: "UHD · 3840 × 2160", width: 3840, height: 2160 },
  { label: "4K · 4096 × 2160", width: 4096, height: 2160 },
] as const;

function normalizeDimension(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, parsed));
}

function picsumUrl(width: number, height: number) {
  return `https://picsum.photos/${width}${width === height ? "" : `/${height}`}`;
}

export function PicsumTool() {
  const [widthInput, setWidthInput] = useState("640");
  const [heightInput, setHeightInput] = useState("400");
  const [preset, setPreset] = useState("640x400");
  const [dimensions, setDimensions] = useState({ width: 640, height: 400 });
  const [imageVersion, setImageVersion] = useState(0);
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const imageUrl = picsumUrl(dimensions.width, dimensions.height);
  const previewUrl = `${imageUrl}?random=${imageVersion}`;

  useEffect(() => {
    const controller = new AbortController();

    fetch(previewUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load image");
        return response.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        if (controller.signal.aborted) {
          URL.revokeObjectURL(url);
          return;
        }
        setImage((previousImage) => {
          if (previousImage) URL.revokeObjectURL(previousImage.url);
          return { blob, url };
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setImageError(true);
      });

    return () => controller.abort();
  }, [previewUrl]);

  function loadImage(width: number, height: number) {
    setWidthInput(String(width));
    setHeightInput(String(height));
    setDimensions({ width, height });
    setImage((previousImage) => {
      if (previousImage) URL.revokeObjectURL(previousImage.url);
      return null;
    });
    setImageVersion((version) => version + 1);
    setImageError(false);
  }

  function generate() {
    loadImage(
      normalizeDimension(widthInput, dimensions.width),
      normalizeDimension(heightInput, dimensions.height),
    );
  }

  function choosePreset(value: string) {
    setPreset(value);
    const size = SIZE_PRESETS.find((item) => `${item.width}x${item.height}` === value);
    if (size) loadImage(size.width, size.height);
  }

  async function saveImage() {
    if (!image) return;
    setIsSaving(true);
    try {
      const blobUrl = URL.createObjectURL(image.blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `picsum-${dimensions.width}x${dimensions.height}.jpg`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setImageError(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-1 flex-col gap-4 min-h-0 lg:grid lg:grid-cols-2">
        <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="picsum-preset">Preset size</label>
          <select
            id="picsum-preset"
            value={preset}
            onChange={(event) => choosePreset(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="custom">Custom</option>
            {SIZE_PRESETS.map((size) => (
              <option key={`${size.width}x${size.height}`} value={`${size.width}x${size.height}`}>
                {size.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="picsum-width">Width</label>
          <Input
            id="picsum-width"
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            value={widthInput}
            onChange={(event) => {
              setWidthInput(event.target.value);
              setPreset("custom");
            }}
            onKeyDown={(event) => event.key === "Enter" && generate()}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="picsum-height">Height</label>
          <Input
            id="picsum-height"
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            value={heightInput}
            onChange={(event) => {
              setHeightInput(event.target.value);
              setPreset("custom");
            }}
            onKeyDown={(event) => event.key === "Enter" && generate()}
          />
        </div>
        <p className="text-xs text-muted-foreground">Use equal dimensions for a square image.</p>
        <Button onClick={generate} className="self-start">
          Generate image
        </Button>
        </div>

        <div className="flex flex-col items-center gap-2 min-h-0">
        <div className="h-8 shrink-0" />
        {image && (
          <img
            src={image.url}
            alt={`Random ${dimensions.width} by ${dimensions.height} image`}
            className="mx-auto w-full max-w-[600px] rounded border border-border object-contain transition-opacity duration-200"
          />
        )}
        <div className="flex w-full flex-col items-center gap-2">
          {imageError ? (
            <p role="alert" className="text-sm text-destructive">Could not load the image. Please try again.</p>
          ) : (
            <Button size="sm" variant="outline" onClick={saveImage} disabled={!image || isSaving}>
              <Download className="mr-1 h-3.5 w-3.5" /> Save image
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
