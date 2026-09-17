import { getSession } from "@/lib/session";

export default async function AdminHomePage() {
  const session = await getSession();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Panel administrativo</h1>
      <p className="text-muted-foreground">Sesión iniciada como {session?.name}.</p>
    </div>
  );
}
