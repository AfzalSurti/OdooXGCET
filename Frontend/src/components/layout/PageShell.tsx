import * as React from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClassName?: string; // e.g. "max-w-7xl"
};

export function PageShell({
  title,
  description,
  actions,
  children,
  maxWidthClassName = "max-w-7xl",
}: PageShellProps) {
  return (
    <div className={cn("w-full px-4 sm:px-6 lg:px-8 py-8", maxWidthClassName, "mx-auto")}>
      <div className="space-y-8">
        <div className="glass-hero section-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[12px] font-medium text-primary-foreground bg-gradient-to-r from-primary/80 to-insight/80 shadow-[0_12px_30px_rgba(45,108,223,0.22)]">
                <span>AI-forward</span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
              </div>
              <h1 className="text-[26px] sm:text-[28px] font-semibold leading-tight text-balance">
                {title}
              </h1>
              {description ? (
                <p className="text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
          <div className="mt-4 h-[2px] w-full rounded-full bg-gradient-to-r from-primary/30 via-insight/30 to-transparent" />
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}


