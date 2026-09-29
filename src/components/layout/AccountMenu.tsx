"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDismiss } from "@/hooks/use-dismiss";

export function AccountMenu({
  label,
  links,
  logoutSlot,
}: {
  label: string;
  links: { href: string; label: string }[];
  logoutSlot: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, open, close);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors duration-300 hover:bg-muted aria-expanded:bg-muted"
      >
        <User className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} />
      </button>
      <div
        className={cn(
          "absolute right-0 top-full z-40 mt-3 w-56 origin-top-right rounded-xl border border-border bg-background p-2 shadow-[0_24px_60px_-20px_rgba(10,10,11,0.25)]",
          "transition-[opacity,translate,scale,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-[0.98] opacity-0",
        )}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={close}
            className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            {link.label}
          </Link>
        ))}
        <div className="mt-1 border-t border-border pt-1 [&_button]:w-full [&_button]:justify-start">
          {logoutSlot}
        </div>
      </div>
    </div>
  );
}
