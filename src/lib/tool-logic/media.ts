import QRCode from "qrcode";

export type QrTab = "generate" | "read";
export type QrEcLevel = "L" | "M" | "Q" | "H";

export const QR_EC_LEVELS: { value: QrEcLevel; label: string }[] = [
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" },
];

export function emptyPixelDataUrl(): string {
  return "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
}

export async function generateQrDataUrl(input: string, ecLevel: QrEcLevel): Promise<string> {
  return QRCode.toDataURL(input, { width: 800, margin: 2, errorCorrectionLevel: ecLevel });
}

export function resolveSvgDimensions(svgEl: SVGElement): { width: number; height: number } {
  const viewBox = svgEl.getAttribute("viewBox");
  let width = parseFloat(svgEl.getAttribute("width") ?? "0");
  let height = parseFloat(svgEl.getAttribute("height") ?? "0");

  if ((!width || !height) && viewBox) {
    const parts = viewBox.split(/[\s,]+/);
    width = parseFloat(parts[2]) || 800;
    height = parseFloat(parts[3]) || 600;
  }

  return { width: width || 800, height: height || 600 };
}
