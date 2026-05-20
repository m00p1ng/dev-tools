import { useCallback, type RefObject } from "react";

export function useDragSlider(
  ref: RefObject<HTMLDivElement>,
  onValue: (pct: number) => void,
) {
  const pick = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    onValue(pct);
  }, [ref, onValue]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pick(e.clientX);
  }, [pick]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.buttons) return;
    pick(e.clientX);
  }, [pick]);

  return { onPointerDown, onPointerMove };
}
