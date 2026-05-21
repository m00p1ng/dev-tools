import { useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { getClaimDisplay, syntaxHighlight } from "./format";

const CLAIM_LABELS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires At",
  nbf: "Not Before",
  iat: "Issued At",
  jti: "JWT ID",
};

const OVERLAY_SHARED = "font-mono text-sm p-3 whitespace-pre-wrap break-words leading-[1.5] tracking-normal";

type TabType = "json" | "claims";

interface DecodedPanelProps {
  title: string;
  data: Record<string, unknown>;
  editable?: boolean;
  editValue?: string;
  onEditChange?: (val: string) => void;
  editError?: string;
}

function JsonPanel({ data }: { data: object }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <pre
      className="font-mono text-sm p-3 overflow-auto leading-relaxed"
      dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
    />
  );
}

function ClaimsPanel({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="p-3 space-y-1 font-mono text-sm overflow-auto">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="flex gap-2">
          <span className="text-blue-300 min-w-[100px] shrink-0">{CLAIM_LABELS[key] ?? key}</span>
          <span className="text-green-400 break-all">{getClaimDisplay(key, val)}</span>
        </div>
      ))}
    </div>
  );
}

function EditableJsonOverlay({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="grid min-h-[80px]">
        <pre
          aria-hidden
          className={`[grid-area:1/1] ${OVERLAY_SHARED} pointer-events-none select-none`}
          dangerouslySetInnerHTML={{ __html: `${syntaxHighlight(value)}\n` }}
        />
        <textarea
          aria-label="Edit JWT payload JSON"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`[grid-area:1/1] ${OVERLAY_SHARED} bg-transparent text-transparent caret-foreground resize-none outline-none`}
          spellCheck={false}
        />
      </div>
      {error && <p className="text-sm text-destructive px-3 pb-2">{error}</p>}
    </div>
  );
}

export function DecodedPanel({ title, data, editable, editValue, onEditChange, editError }: DecodedPanelProps) {
  const [tab, setTab] = useState<TabType>("json");
  const json = JSON.stringify(data, null, 2);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/40">
        <span className="text-sm font-semibold text-muted-foreground">{title}</span>
        <div className="flex items-center gap-1">
          <div className="flex text-xs rounded overflow-hidden border border-border">
            {(["json", "claims"] as TabType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-2 py-0.5 transition-colors ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "json" ? "JSON" : "Claims"}
              </button>
            ))}
          </div>
          <CopyButton text={json} />
        </div>
      </div>
      <div className="bg-background overflow-auto">
        {tab === "json" && editable ? (
          <EditableJsonOverlay value={editValue ?? json} onChange={onEditChange ?? (() => {})} error={editError} />
        ) : tab === "json" ? (
          <JsonPanel data={data} />
        ) : (
          <ClaimsPanel data={data} />
        )}
      </div>
    </div>
  );
}
