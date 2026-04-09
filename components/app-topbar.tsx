import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AppTopbarProps = {
  eyebrow: string;
  title: string;
  description?: string;
  rightSlot: ReactNode;
  className?: string;
};

export function AppTopbar({ eyebrow, title, description, rightSlot, className }: AppTopbarProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 rounded-[1.7rem] border border-white/45 bg-[linear-gradient(180deg,rgba(255,251,247,0.95),rgba(244,236,227,0.92))] px-4 py-3 shadow-[0_22px_55px_-42px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/55">{eyebrow}</p>
        <h1 className="mt-1 text-[1.9rem] font-bold tracking-tight text-primary">{title}</h1>
        {description ? <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center justify-center self-center">{rightSlot}</div>
    </header>
  );
}
