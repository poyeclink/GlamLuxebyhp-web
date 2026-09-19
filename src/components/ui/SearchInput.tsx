// Sin JS: un <form method="GET"> normal, mismo espíritu que los filtros de
// /tienda?categoria= y /admin/pedidos?estado= (estado en la URL, no en un
// useState) — al enviar, omite `page` a propósito para que una búsqueda
// nueva siempre vuelva a la página 1 en vez de heredar la página en la que
// el admin estaba parado.
export function SearchInput({
  action,
  placeholder,
  defaultValue,
  hiddenParams,
}: {
  action: string;
  placeholder: string;
  defaultValue?: string;
  hiddenParams?: Record<string, string>;
}) {
  return (
    <form action={action} method="GET" className="flex w-full max-w-sm items-center">
      {hiddenParams &&
        Object.entries(hiddenParams).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <div className="relative w-full">
        <span
          className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground"
          aria-hidden="true"
        >
          search
        </span>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>
    </form>
  );
}
