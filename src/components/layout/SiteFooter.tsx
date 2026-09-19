import Link from "next/link";
import { listShopCategories } from "@/server/services/category-service";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/layout/SocialIcons";

const COMPANY_LINKS = [
  { href: "/about", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

const LEGAL_LINKS = [
  { href: "/politicas/terminos", label: "Términos y condiciones" },
  { href: "/politicas/privacidad", label: "Política de privacidad" },
  { href: "/politicas/devoluciones", label: "Política de devoluciones" },
];

// Cuántas categorías caben antes de que la columna se vuelva demasiado larga
// — con más que esto, "Ver todas" hacia /tienda cubre el resto sin que el
// footer crezca sin límite a medida que el catálogo crece.
const MAX_FOOTER_CATEGORIES = 8;

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-foreground">{title}</span>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
      {children}
    </Link>
  );
}

function SocialButton({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

export async function SiteFooter() {
  const categories = await listShopCategories();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL;
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL;
  const hasSocialLinks = Boolean(whatsappNumber || instagramUrl || facebookUrl || tiktokUrl);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
          <span className="text-lg font-semibold text-foreground">GlamLuxeByHp</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Moda mayorista y al detalle. Compra 6+ artículos variados y obtén precio mayorista.
          </p>
        </div>

        {categories.length > 0 && (
          <FooterColumn title="Categorías">
            {categories.slice(0, MAX_FOOTER_CATEGORIES).map((category) => (
              <FooterLink key={category.id} href={`/tienda?categoria=${category.slug}`}>
                {category.name}
              </FooterLink>
            ))}
            {categories.length > MAX_FOOTER_CATEGORIES && (
              <FooterLink href="/tienda">Ver todas</FooterLink>
            )}
          </FooterColumn>
        )}

        <FooterColumn title="Empresa">
          {COMPANY_LINKS.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Legal">
          {LEGAL_LINKS.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-border px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GlamLuxeByHp. Todos los derechos reservados.
          </p>
          {hasSocialLinks && (
            <div className="flex items-center gap-2">
              {whatsappNumber && (
                <SocialButton href={`https://wa.me/${whatsappNumber}`} label="WhatsApp" icon={WhatsAppIcon} />
              )}
              {instagramUrl && <SocialButton href={instagramUrl} label="Instagram" icon={InstagramIcon} />}
              {facebookUrl && <SocialButton href={facebookUrl} label="Facebook" icon={FacebookIcon} />}
              {tiktokUrl && <SocialButton href={tiktokUrl} label="TikTok" icon={TikTokIcon} />}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
