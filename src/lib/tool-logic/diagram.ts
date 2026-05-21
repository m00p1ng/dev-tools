import { resolveSvgDimensions } from "./media";

export type ImageFormat = "png" | "jpg" | "svg";

function downloadSvg(svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "diagram.svg";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadRaster(svg: string, format: "png" | "jpg") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const svgEl = doc.querySelector("svg")!;

  const { width: w, height: h } = resolveSvgDimensions(svgEl);
  svgEl.setAttribute("width", String(w));
  svgEl.setAttribute("height", String(h));

  const svgStr = new XMLSerializer().serializeToString(svgEl);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    if (format === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    const a = document.createElement("a");
    a.href = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
    a.download = `diagram.${format}`;
    a.click();
  };
  img.src = dataUrl;
}

export function downloadDiagram(svg: string, format: ImageFormat) {
  if (format === "svg") downloadSvg(svg);
  else downloadRaster(svg, format);
}
