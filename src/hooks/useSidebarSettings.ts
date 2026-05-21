import { useState } from "react";

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem("favorites");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: string[]) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function loadHiddenTools(): string[] {
  try {
    const raw = localStorage.getItem("hidden-tools");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHiddenTools(ids: string[]) {
  localStorage.setItem("hidden-tools", JSON.stringify(ids));
}

export function useSidebarSettings() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [hiddenTools, setHiddenTools] = useState<string[]>(loadHiddenTools);

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }

  function toggleHidden(id: string) {
    setHiddenTools((prev) => {
      const next = prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id];
      saveHiddenTools(next);
      return next;
    });
  }

  function resetHidden() {
    setHiddenTools([]);
    saveHiddenTools([]);
  }

  return { favorites, hiddenTools, toggleFav, toggleHidden, resetHidden };
}
