import Link from "next/link";

const HELP_LINKS = [
  { href: "/about", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/politicas", label: "Políticas y términos" },
];

export function SiteFooter() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold text-foreground">GlamLuxeByHp</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Moda mayorista y al detalle. Compra 6+ artículos variados y obtén precio mayorista.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Ayuda</span>
          {HELP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {whatsappNumber && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">Contacto</span>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GlamLuxeByHp. Todos los derechos reservados.
      </div>
    </footer>
  );
}
