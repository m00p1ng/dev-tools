import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  type Variants,
} from "framer-motion";
import { TOOLS } from "@/tools";

const GROUPS = [...new Set(TOOLS.map((t) => t.group))];

const GROUP_ACCENT: Record<string, string> = {
  Time:       "#60a5fa",
  Data:       "#fbbf24",
  Encoding:   "#c084fc",
  Web:        "#34d399",
  Security:   "#f87171",
  Generators: "#fb923c",
};

const GROUP_DESC: Record<string, string> = {
  Time:       "Timestamps & cron",
  Data:       "JSON · YAML · CSV",
  Encoding:   "Base64 · URL · escape",
  Web:        "URL parser & diagrams",
  Security:   "JWT & hashes",
  Generators: "UUID · Lorem · QR",
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ── TiltCard ──────────────────────────────────────────────────────────────────

interface TiltCardProps {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onHoverEnd?: () => void;
}

function TiltCard({ children, variants, className, style, onClick, onMouseEnter, onHoverEnd }: TiltCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sc   = useMotionValue(1);
  const springRotX = useSpring(rotX, { stiffness: 420, damping: 30 });
  const springRotY = useSpring(rotY, { stiffness: 420, damping: 30 });
  const springSc   = useSpring(sc,   { stiffness: 420, damping: 30 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    rotX.set(-((e.clientY - r.top)  / r.height - 0.5) * 14);
    rotY.set( ((e.clientX - r.left) / r.width  - 0.5) * 14);
    sc.set(1.025);
  };

  const handleLeave = () => {
    rotX.set(0); rotY.set(0); sc.set(1);
    onHoverEnd?.();
  };

  return (
    <motion.button
      ref={ref}
      variants={variants}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={onMouseEnter}
      onMouseDown={() => sc.set(0.97)}
      onMouseUp={() => sc.set(1.025)}
      onClick={onClick}
      className={className}
      style={{
        rotateX: springRotX,
        rotateY: springRotY,
        scale: springSc,
        transformStyle: "preserve-3d",
        transformPerspective: 700,
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────

interface OnboardingProps {
  onComplete: (toolId?: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  // Grid spotlight
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.04), transparent 80%)`;

  // Magnetic CTA
  const btnRef = useRef<HTMLButtonElement>(null);
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const sbx = useSpring(bx, { stiffness: 300, damping: 22 });
  const sby = useSpring(by, { stiffness: 300, damping: 22 });

  const handleBtnMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    bx.set((e.clientX - r.left - r.width  / 2) * 0.3);
    by.set((e.clientY - r.top  - r.height / 2) * 0.3);
  };

  const launch = (toolId?: string) => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => onComplete(toolId), 500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      style={{ pointerEvents: exiting ? "none" : undefined }}
    >
      <div className="flex flex-col items-center gap-10 px-8 w-full max-w-2xl">

        {/* Title */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Dev Tools
          </h1>
          <p className="text-sm text-muted-foreground">
            {TOOLS.length} tools across {GROUPS.length} categories
          </p>
        </motion.div>

        {/* Grid + spotlight */}
        <div
          className="relative w-full"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mouseX.set(e.clientX - r.left);
            mouseY.set(e.clientY - r.top);
          }}
          onMouseLeave={() => { mouseX.set(-500); mouseY.set(-500); }}
        >
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none z-10"
            style={{ background: spotlight }}
          />

          <motion.div
            className="grid grid-cols-3 gap-2"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
          >
            {GROUPS.map((group) => {
              const tools  = TOOLS.filter((t) => t.group === group);
              const accent = GROUP_ACCENT[group];
              const isHov  = hovered === group;

              return (
                <TiltCard
                  key={group}
                  variants={cardVariants}
                  onClick={() => launch(tools[0].id)}
                  onMouseEnter={() => setHovered(group)}
                  onHoverEnd={() => setHovered(null)}
                  className="text-left p-4 rounded-lg border border-border bg-card cursor-pointer"
                  style={{
                    borderColor: isHov ? accent + "66" : undefined,
                    backgroundColor: isHov ? accent + "0a" : undefined,
                    transition: "border-color 0.15s ease, background-color 0.15s ease",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: accent }}
                      animate={isHov ? { scale: [1, 1.6, 1] } : { scale: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="text-xs font-medium text-foreground">{group}</span>
                  </div>

                  <p className="text-[11px] text-muted-foreground mb-3">{GROUP_DESC[group]}</p>

                  <p className="text-[10px] text-muted-foreground/50">{tools.length} tools</p>
                </TiltCard>
              );
            })}
          </motion.div>
        </div>

        {/* Magnetic CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <motion.button
            ref={btnRef}
            onMouseMove={handleBtnMove}
            onMouseLeave={() => { bx.set(0); by.set(0); }}
            onClick={() => launch()}
            style={{ x: sbx, y: sby }}
            className="px-8 py-2 text-sm font-medium rounded-md bg-foreground text-background hover:opacity-80 transition-opacity"
          >
            Get started
          </motion.button>
          <p className="text-[11px] text-muted-foreground/40">
            or click a category to jump in
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}
