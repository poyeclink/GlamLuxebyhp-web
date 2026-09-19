import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-16">
      <Link href="/politicas" className="text-sm text-muted-foreground hover:text-foreground">
        ← Políticas y términos
      </Link>
      <h1 className="text-2xl font-semibold text-foreground">Términos y condiciones</h1>
      <p className="text-sm text-muted-foreground">Contenido próximamente.</p>
    </div>
  );
}
