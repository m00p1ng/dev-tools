import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { Textarea } from "@/components/ui/textarea";

const CodeBlock = lazy(async () => ({ default: (await import("@/components/ui/code-block")).CodeBlock }));
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { Download, Upload, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import jsQR from "jsqr";
import { emptyPixelDataUrl, generateQrDataUrl, QR_EC_LEVELS, type QrEcLevel, type QrTab } from "@/lib/tool-logic/media";

export function QrCodeTool() {
  const [tab, setTab] = useState<QrTab>("generate");
  const [input, setInput] = useLocalStorage("tool:qrcode-gen", "");
  const [ecLevel, setEcLevel] = useLocalStorage<QrEcLevel>("tool:qrcode-ec", "H");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [genError, setGenError] = useState("");
  const [readResult, setReadResult] = useState("");
  const [readError, setReadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDragging: isGenDragging, dropProps: genDropProps } = useDropText(setInput);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!input.trim()) {
        setQrDataUrl("");
        setGenError("");
        return;
      }
      try {
        const url = await generateQrDataUrl(input, ecLevel);
        setQrDataUrl(url);
        setGenError("");
      } catch {
        setGenError("QR generation failed");
      }
    }, input.trim() ? 300 : 0);
    return () => clearTimeout(timer);
  }, [input, ecLevel]);

  function downloadQr() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qrcode.png";
    a.click();
  }

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height);
        if (code) {
          setReadResult(code.data);
          setReadError("");
        } else {
          setReadResult("");
          setReadError("No QR code found in image");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) readFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  const tabButtons = (["generate", "read"] as QrTab[]).map((t) => (
    <Button key={t} size="sm" variant={tab === t ? "default" : "outline"}
      onClick={() => setTab(t)} className="capitalize">
      {t}
    </Button>
  ));

  return (
    <div className="flex h-full flex-col gap-3">
      {tab === "generate" ? (
        <div className="flex flex-col lg:grid lg:grid-cols-2 flex-1 gap-4 min-h-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">{tabButtons}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-sm text-muted-foreground"
                  onClick={() => setInput("https://example.com")}>
                  Example
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setInput("")}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Text or URL to encode… or drop a file"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={cn("font-mono text-sm transition-all duration-150 min-h-[7.5rem]",
                isGenDragging && "ring-2 ring-primary/50 bg-primary/5")}
              {...genDropProps}
            />
            {genError && <Badge variant="destructive" className="self-start text-sm">{genError}</Badge>}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-8" />
            <img
              src={qrDataUrl || emptyPixelDataUrl()}
              alt="QR Code"
              className="rounded border border-border transition-opacity duration-200 w-full max-w-[300px] aspect-square object-contain"
              style={{ opacity: qrDataUrl ? 1 : 0 }}
            />
            <div style={{ opacity: qrDataUrl ? 1 : 0, pointerEvents: qrDataUrl ? "auto" : "none", transition: "opacity 0.2s" }}
              className="flex flex-col items-center gap-2 w-full">
              <select
                value={ecLevel}
                onChange={(e) => setEcLevel(e.target.value as QrEcLevel)}
                className="h-7 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {QR_EC_LEVELS.map((ec) => (
                  <option key={ec.value} value={ec.value}>{ec.label}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" onClick={downloadQr}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-1">{tabButtons}</div>
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-base text-muted-foreground">Drop QR image here or click to upload</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {readError && <Badge variant="destructive" className="self-start text-sm">{readError}</Badge>}

          {readResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium">Decoded content</p>
                <CopyButton text={readResult} withLabel />
              </div>
              <div className="h-24">
                <Suspense fallback={<div className="h-full rounded-md border border-input bg-background" />}>
                  <CodeBlock code={readResult} language="text" />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
