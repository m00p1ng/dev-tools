import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/tools";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { Search, Star } from "lucide-react";

interface SidebarProps {
  activeTool: string;
  onSelect: (id: string) => void;
}

function ToolIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}

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

function ToolButton({
  tool,
  active,
  isFav,
  onSelect,
  onToggleFav,
}: {
  tool: (typeof TOOLS)[number];
  active: boolean;
  isFav: boolean;
  onSelect: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      layout
      className={cn(
        "group w-full rounded-md px-3 py-2 text-left text-sm transition-colors flex items-center gap-2.5",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <ToolIcon name={tool.icon} className={cn("size-3.5 shrink-0", tool.color)} />
      <span className="flex-1 truncate">{tool.label}</span>
      <motion.div
        onClick={onToggleFav}
        whileTap={{ scale: 1.5, rotate: 20 }}
        transition={{ type: "spring", stiffness: 600, damping: 12 }}
      >
        <Star
          className={cn(
            "size-3 shrink-0 transition-all duration-200",
            isFav
              ? "fill-yellow-400 text-yellow-400 opacity-100"
              : "opacity-0 group-hover:opacity-60 text-muted-foreground"
          )}
        />
      </motion.div>
    </motion.button>
  );
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function Sidebar({ activeTool, onSelect }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const favSet = new Set(favorites);

  function toggleFav(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }

  const filtered = TOOLS.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  const toolMap = new Map(TOOLS.map((t) => [t.id, t]));
  const favTools = favorites.map((id) => toolMap.get(id)).filter(Boolean) as (typeof TOOLS)[number][];
  const isSearching = query.length > 0;
  const nonFavFiltered = isSearching
    ? filtered
    : filtered.filter((t) => !favSet.has(t.id));

  return (
    <aside className="flex h-screen w-72 flex-shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <nav className="px-2 pb-4">
          <AnimatePresence initial={false}>
            {!isSearching && favTools.length > 0 && (
              <motion.div
                key="favorites-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-1 overflow-hidden"
              >
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Favorites
                </p>
                <motion.div variants={listVariants} initial="hidden" animate="visible">
                  {favTools.map((tool) => (
                    <motion.div key={tool.id} variants={itemVariants}>
                      <ToolButton
                        tool={tool}
                        active={activeTool === tool.id}
                        isFav
                        onSelect={() => onSelect(tool.id)}
                        onToggleFav={(e) => toggleFav(e, tool.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                <div className="my-2 border-t border-border" />
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  All Tools
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {nonFavFiltered.length === 0 && (!isSearching ? favTools.length === 0 : true) ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-2 py-4 text-center text-xs text-muted-foreground"
            >
              No tools found
            </motion.p>
          ) : (
            <motion.div variants={listVariants} initial="hidden" animate="visible">
              {nonFavFiltered.map((tool) => (
                <motion.div key={tool.id} variants={itemVariants}>
                  <ToolButton
                    tool={tool}
                    active={activeTool === tool.id}
                    isFav={favSet.has(tool.id)}
                    onSelect={() => onSelect(tool.id)}
                    onToggleFav={(e) => toggleFav(e, tool.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}
