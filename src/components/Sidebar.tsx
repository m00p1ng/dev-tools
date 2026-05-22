import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/tools";
import { Search, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarSettings } from "@/hooks/useSidebarSettings";
import { ManagePanel } from "@/components/ManagePanel";

interface SidebarProps {
  activeTool: string;
  onSelect: (id: string) => void;
  overlay?: boolean;
}

function ToolButton({
  tool,
  active,
  isFav,
  showDescription = false,
  showFavorite = true,
  onSelect,
  onToggleFav,
}: {
  tool: (typeof TOOLS)[number];
  active: boolean;
  isFav: boolean;
  showDescription?: boolean;
  showFavorite?: boolean;
  onSelect: () => void;
  onToggleFav: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex w-full items-center rounded-md transition-colors",
        active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
      )}
    >
      <motion.button
        onClick={onSelect}
        layout
        className={cn(
          "flex flex-1 gap-2.5 px-3 py-2 text-left text-sm touch-manipulation min-w-0",
          showDescription ? "items-start" : "items-center",
          active
            ? "text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground"
        )}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <tool.icon className={cn("size-3.5 shrink-0", showDescription && "mt-0.5", tool.color)} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate">{tool.label}</span>
          {showDescription && (
            <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
              {tool.description}
            </span>
          )}
        </span>
      </motion.button>

      {showFavorite && (
        <motion.button
          onClick={onToggleFav}
          whileTap={{ scale: 1.4, rotate: 20 }}
          transition={{ type: "spring", stiffness: 600, damping: 12 }}
          className="flex shrink-0 items-center justify-center px-3 py-2 touch-manipulation"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn(
              "size-3.5 shrink-0 transition-all duration-200",
              isFav
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground opacity-40 sm:opacity-0 sm:group-hover:opacity-60"
            )}
          />
        </motion.button>
      )}
    </div>
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

export function Sidebar({ activeTool, onSelect, overlay = false }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const { favorites, hiddenTools, toggleFav, toggleHidden, resetHidden } = useSidebarSettings();

  const selectTool = (id: string) => {
    onSelect(id);
    setQuery("");
  };

  const favSet = new Set(favorites);
  const hiddenSet = new Set(hiddenTools);
  const visibleTools = TOOLS.filter((t) => !hiddenSet.has(t.id));
  const normalizedQuery = query.toLowerCase();
  const filtered = visibleTools.filter((t) => {
    const label = t.label.toLowerCase();
    const description = t.description.toLowerCase();

    return label.includes(normalizedQuery) || description.includes(normalizedQuery);
  });

  const toolMap = new Map(TOOLS.map((t) => [t.id, t]));
  const favTools = favorites
    .map((id) => toolMap.get(id))
    .filter((t) => t && !hiddenSet.has(t.id)) as (typeof TOOLS)[number][];
  const isSearching = query.length > 0;
  const isSearchActive = isSearching || searchFocused;
  const nonFavFiltered = isSearchActive
    ? filtered
    : filtered.filter((t) => !favSet.has(t.id));

  const groups = isSearchActive
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
    <aside
      className={cn(
        "flex w-72 flex-shrink-0 flex-col border-r border-border bg-sidebar",
        overlay ? "safe-area-sidebar h-full" : "h-full"
      )}
    >
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              className="h-8 pl-8 text-xs"
              disabled={showManage}
            />
          </div>
          <motion.div
            animate={{ width: isSearchActive ? 0 : "1.5rem", opacity: isSearchActive ? 0 : 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden shrink-0"
          >
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowManage((v) => !v)}
              title="Manage Tools"
              className={cn(showManage && "bg-sidebar-accent text-sidebar-accent-foreground")}
              tabIndex={isSearchActive ? -1 : 0}
            >
              <Settings className="size-3.5" />
            </Button>
          </motion.div>
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
            <ManagePanel
              allGroups={allGroups}
              hiddenTools={hiddenTools}
              onToggleHidden={toggleHidden}
              onReset={resetHidden}
            />
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
                  {!isSearchActive && favTools.length > 0 && (
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
                              onSelect={() => selectTool(tool.id)}
                              onToggleFav={() => toggleFav(tool.id)}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                      <div className="my-2 border-t border-border" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {nonFavFiltered.length === 0 && (!isSearchActive ? favTools.length === 0 : true) ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-2 py-4 text-center text-xs text-muted-foreground"
                  >
                    No tools found
                  </motion.p>
                ) : isSearchActive ? (
                  <motion.div variants={listVariants} initial="hidden" animate="visible">
                    {nonFavFiltered.map((tool) => (
                      <motion.div key={tool.id} variants={itemVariants}>
                        <ToolButton
                          tool={tool}
                          active={activeTool === tool.id}
                          isFav={favSet.has(tool.id)}
                          showDescription
                          showFavorite={false}
                          onSelect={() => selectTool(tool.id)}
                          onToggleFav={() => toggleFav(tool.id)}
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
                                onSelect={() => selectTool(tool.id)}
                                onToggleFav={() => toggleFav(tool.id)}
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

      <div className="border-t border-border px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Dev tools</span>
        <a
          href="https://github.com/m00p1ng/dev-tools"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
