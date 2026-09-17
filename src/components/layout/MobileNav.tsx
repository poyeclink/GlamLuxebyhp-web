"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type NavLink = {
  href: string;
  label: string;
};

export function MobileNav({ links, authSlot }: { links: NavLink[]; authSlot: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-border bg-background px-4 py-4 shadow-sm">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-3">{authSlot}</div>
          </nav>
        </div>
      )}
    </div>
  );
}
