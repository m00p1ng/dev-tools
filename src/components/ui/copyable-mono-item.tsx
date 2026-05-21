import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

interface CopyableMonoItemProps {
  text: string;
  className?: string;
}

export function CopyableMonoItem({ text, className }: CopyableMonoItemProps) {
  return (
    <div className={cn("group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted transition-colors", className)}>
      <span className="font-mono text-sm flex-1 break-all select-all">{text}</span>
      <CopyButton text={text} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
