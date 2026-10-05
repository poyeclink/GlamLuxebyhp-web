import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { tMany } from "@/lib/i18n";

export default async function ShopNotFound() {
  const copy = await tMany({
    eyebrow: "Error 404",
    title: "No encontramos esta página",
    text: "Puede que el enlace haya cambiado o que la página ya no exista.",
    shop: "Ir a la tienda",
    home: "Volver al inicio",
  });

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
      <span className="eyebrow text-accent">{copy.eyebrow}</span>
      <h1 className="font-display text-4xl text-foreground sm:text-5xl">{copy.title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{copy.text}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/tienda">
          <Button size="lg">{copy.shop}</Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg">
            {copy.home}
          </Button>
        </Link>
      </div>
    </section>
  );
}
