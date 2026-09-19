import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

const POLICY_LINKS = [
  { href: "/politicas/terminos", label: "Términos y condiciones" },
  { href: "/politicas/privacidad", label: "Política de privacidad" },
  { href: "/politicas/devoluciones", label: "Política de devoluciones" },
];

export default function PoliciesIndexPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Políticas y términos</h1>
      <div className="flex flex-col gap-3">
        {POLICY_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-colors hover:border-foreground">
              <CardContent className="p-4 text-sm font-medium text-foreground">{link.label}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
