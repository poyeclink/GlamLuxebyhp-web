"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

// Versalitas espaciadas con un filete que se abre desde el centro; en la
// página activa el filete queda fijo en el color de acento.
export const navItemClass =
  "relative flex h-11 items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-foreground/60 transition-colors duration-300 hover:text-foreground aria-[current=page]:text-foreground aria-expanded:text-foreground after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:scale-x-0 after:bg-foreground after:transition-[scale] after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 aria-expanded:after:scale-x-100 aria-[current=page]:after:scale-x-100 aria-[current=page]:after:bg-accent";

export function MainNav({
  links,
  categoriesSlot,
}: {
  links: NavLink[];
  categoriesSlot: React.ReactNode;
}) {
  const pathname = usePathname();
  const [first, ...rest] = links;
  const renderLink = (link: NavLink) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={pathname === link.href ? "page" : undefined}
      className={navItemClass}
    >
      {link.label}
    </Link>
  );

  return (
    <nav aria-label="Principal" className="flex items-center justify-center gap-7 xl:gap-9">
      {renderLink(first)}
      {categoriesSlot}
      {rest.map(renderLink)}
    </nav>
  );
}
