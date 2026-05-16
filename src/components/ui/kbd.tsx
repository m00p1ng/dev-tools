import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px] leading-none text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  );
}
