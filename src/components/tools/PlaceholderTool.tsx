import { Wrench } from "lucide-react";

interface PlaceholderToolProps {
  label: string;
}

export function PlaceholderTool({ label }: PlaceholderToolProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <Wrench className="h-10 w-10 opacity-30" />
      <p className="text-sm">{label} — coming soon</p>
    </div>
  );
}
