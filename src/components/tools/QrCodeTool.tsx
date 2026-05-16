import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Download, Upload, Copy, RotateCcw } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";
import QRCode from "qrcode";
import jsQR from "jsqr";

type Tab = "generate" | "read";

export function QrCodeTool() {
  const [tab, setTab] = useState<Tab>("generate");
  const [input, setInput] = useLocalStorage("tool:qrcode-gen", "");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [genError, setGenError] = useState("");
  const [readResult, setReadResult] = useState("");
  const [readError, setReadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!input.trim()) { setQrDataUrl(""); setGenError(""); return; }
    const timer = setTimeout(async () => {
      try {
        const url = await QRCode.toDataURL(input, { width: 300, margin: 2 });
        setQrDataUrl(url);
        setGenError("");
      } catch {
        setGenError("QR generation failed");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

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

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-1">
        {(["generate", "read"] as Tab[]).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"}
            onClick={() => setTab(t)} className="capitalize">
            {t}
          </Button>
        ))}
      </div>

      {tab === "generate" && (
        <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">
          <div className="flex flex-col gap-2 flex-1">
            <Textarea
              placeholder="Text or URL to encode..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 resize-none font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setInput("")}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
                onClick={() => setInput("https://example.com")}>
                Example
              </Button>
            </div>
            <div className="flex gap-2" style={{ opacity: qrDataUrl ? 1 : 0, pointerEvents: qrDataUrl ? "auto" : "none", transition: "opacity 0.2s" }}>
              <Button size="sm" variant="outline" onClick={downloadQr}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
            </div>
            {genError && <Badge variant="destructive" className="self-start text-xs">{genError}</Badge>}
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0" style={{ width: 200 }}>
            <img
              src={qrDataUrl || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="}
              alt="QR Code"
              className="rounded border border-border transition-opacity duration-200"
              style={{ width: 200, height: 200, opacity: qrDataUrl ? 1 : 0 }}
            />
          </div>
        </div>
      )}

      {tab === "read" && (
        <div className="flex flex-col gap-3 flex-1">
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop QR image here or click to upload</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {readError && <Badge variant="destructive" className="self-start text-xs">{readError}</Badge>}

          {readResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Decoded content</p>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(readResult)}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </div>
              <Textarea readOnly value={readResult} className="font-mono text-xs resize-none h-24" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
