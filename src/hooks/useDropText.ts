import { useState, useLayoutEffect, useRef } from "react";

export function useDropText(onDrop: (text: string) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const onDropRef = useRef(onDrop);

  useLayoutEffect(() => {
    onDropRef.current = onDrop;
  });

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const text = await file.text();
      onDropRef.current(text);
      return;
    }
    const text = e.dataTransfer.getData("text");
    if (text) onDropRef.current(text);
  }

  return {
    isDragging,
    dropProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
