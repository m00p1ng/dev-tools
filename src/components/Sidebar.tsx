import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/tools";
import {
  AlignLeft,
  Binary,
  Braces,
  Clock,
  Code,
  FileCode,
  FileJson,
  Fingerprint,
  GitFork,
  Globe,
  Hash,
  KeyRound,
  Link,
  QrCode,
  RotateCcw,
  Search,
  Settings,
  Shuffle,
  Star,
  Table,
  TableProperties,
  Timer,
  type LucideProps,
} from "lucide-react";

interface SidebarProps {
  activeTool: string;
  onSelect: (id: string) => void;
}

const TOOL_ICONS: Record<string, React.FC<LucideProps>> = {
  AlignLeft,
  Binary,
  Braces,
  Clock,
  Code,
  FileCode,
  FileJson,
  Fingerprint,
  GitFork,
  Globe,
  Hash,
  KeyRound,
  Link,
  QrCode,
  Shuffle,
  Table,
  TableProperties,
  Timer,
};

function ToolIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = TOOL_ICONS[name];
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
  const [hiddenTools, setHiddenTools] = useState<string[]>(loadHiddenTools);
  const [showManage, setShowManage] = useState(false);
  const favSet = new Set(favorites);
  const hiddenSet = new Set(hiddenTools);

  function toggleFav(e: React.MouseEvent, id: string) {
    e.stopPropagation();
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

  const visibleTools = TOOLS.filter((t) => !hiddenSet.has(t.id));

  const filtered = visibleTools.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  const toolMap = new Map(TOOLS.map((t) => [t.id, t]));
  const favTools = favorites
    .map((id) => toolMap.get(id))
    .filter((t) => t && !hiddenSet.has(t.id)) as (typeof TOOLS)[number][];
  const isSearching = query.length > 0;
  const nonFavFiltered = isSearching
    ? filtered
    : filtered.filter((t) => !favSet.has(t.id));

  const groups = isSearching
    ? null
    : Array.from(
        nonFavFiltered.reduce((acc, t) => {
          if (!acc.has(t.group)) acc.set(t.group, []);
          acc.get(t.group)!.push(t);
          return acc;
        }, new Map<string, (typeof TOOLS)[number][]>())
      );

  const allGroups = Array.from(
    TOOLS.reduce((acc, t) => {
      if (!acc.has(t.group)) acc.set(t.group, []);
      acc.get(t.group)!.push(t);
      return acc;
    }, new Map<string, (typeof TOOLS)[number][]>())
  );

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
            disabled={showManage}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {showManage ? (
          <motion.div
            key="manage"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.15 }}
            className="flex flex-1 min-h-0 flex-col"
          >
            <div className="flex items-center justify-between px-4 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Visible Tools
              </span>
              {hiddenTools.length > 0 && (
                <button
                  onClick={resetHidden}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="size-2.5" />
                  Reset
                </button>
              )}
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-3 pb-4 space-y-4">
                {allGroups.map(([group, tools]) => (
                  <div key={group}>
                    <p className="px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    <div className="space-y-1">
                      {tools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-sidebar-accent/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ToolIcon name={tool.icon} className={cn("size-3.5 shrink-0", tool.color)} />
                            <span className="text-xs text-sidebar-foreground truncate">{tool.label}</span>
                          </div>
                          <Switch
                            checked={!hiddenSet.has(tool.id)}
                            onCheckedChange={() => toggleHidden(tool.id)}
                            className="shrink-0 ml-2 scale-75"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        ) : (
          <motion.div
            key="tools"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.15 }}
            className="flex flex-1 min-h-0 flex-col"
          >
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
                ) : isSearching ? (
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
                ) : (
                  <>
                    {groups!.map(([group, tools]) => (
                      <div key={group} className="mb-1">
                        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {group}
                        </p>
                        <motion.div variants={listVariants} initial="hidden" animate="visible">
                          {tools.map((tool) => (
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
                      </div>
                    ))}
                  </>
                )}
              </nav>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-border px-3 py-2">
        <button
          onClick={() => setShowManage((v) => !v)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
            showManage
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          )}
        >
          <Settings className="size-3.5 shrink-0" />
          <span>Manage Tools</span>
          {hiddenTools.length > 0 && !showManage && (
            <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {hiddenTools.length} hidden
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
