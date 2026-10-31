import Image from "next/image";
import { countCustomers, listCustomersAdmin } from "@/server/services/customer-service";
import { DataTable } from "@/components/ui/DataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCardList, AdminListCard } from "@/components/admin/AdminListCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { ADMIN_PAGE_SIZE, formatCurrency, formatDate } from "@/lib/utils";
import { getAdminT, getLocale } from "@/lib/i18n";

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  // wa.me exige el código de país; un número de EE.UU. de 10 dígitos sin el 1 no abre el chat.
  return `https://wa.me/${digits.length === 10 ? `1${digits}` : digits}`;
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-foreground">
      {url ? (
        <Image src={url} alt="" fill sizes="40px" className="object-cover" />
      ) : (
        name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}

const linkClass = "text-sm font-medium text-accent hover:underline";

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/clientes">) {
  const { q, page: pageParam } = await searchParams;
  const [t, locale] = await Promise.all([getAdminT(), getLocale()]);
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : undefined;
  const page = Math.max(Number(typeof pageParam === "string" ? pageParam : "1") || 1, 1);

  const [{ items: customers, total }, customerCount] = await Promise.all([
    listCustomersAdmin({ search, page }),
    countCustomers(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow={t("Ventas")}
        title={t("Clientes")}
        description={
          customerCount === 1
            ? t("1 cliente registrado.")
            : t("{count} clientes registrados.", { count: customerCount })
        }
      />

      <SearchInput
        action="/admin/clientes"
        placeholder={t("Buscar por nombre, correo o teléfono...")}
        defaultValue={search}
      />

      {customers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {search
            ? t('No encontramos clientes para "{search}".', { search })
            : t("Todavía no hay clientes registrados.")}
        </p>
      ) : (
        <>
          <AdminCardList>
            {customers.map((customer) => (
              <AdminListCard
                key={customer.id}
                media={<Avatar name={customer.name} url={customer.avatarUrl} />}
                title={customer.name}
                meta={
                  <>
                    <span className="block truncate">{customer.email}</span>
                    {customer.whatsapp && <span className="block">{customer.whatsapp}</span>}
                    <span className="block">
                      {t("Desde {date}", { date: formatDate(customer.createdAt, locale) })} ·{" "}
                      {customer.paidOrders === 1
                        ? t("1 compra")
                        : t("{count} compras", { count: customer.paidOrders })}
                    </span>
                  </>
                }
                aside={formatCurrency(customer.totalSpent)}
                actions={
                  <>
                    <a href={`mailto:${customer.email}`} className={`${linkClass} -my-2.5 py-2.5`}>
                      {t("Correo")}
                    </a>
                    {customer.whatsapp && (
                      <a
                        href={whatsappHref(customer.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${linkClass} -my-2.5 py-2.5`}
                      >
                        WhatsApp
                      </a>
                    )}
                  </>
                }
              />
            ))}
          </AdminCardList>
          <DataTable className="hidden md:block">
            <thead>
              <tr>
                <th>{t("Cliente")}</th>
                <th>{t("Correo")}</th>
                <th>WhatsApp</th>
                <th>{t("Registro")}</th>
                <th>{t("Compras")}</th>
                <th>{t("Total gastado")}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={customer.name} url={customer.avatarUrl} />
                      <span className="font-medium text-foreground">{customer.name}</span>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${customer.email}`} className={linkClass}>
                      {customer.email}
                    </a>
                  </td>
                  <td>
                    {customer.whatsapp ? (
                      <a
                        href={whatsappHref(customer.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {customer.whatsapp}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="text-muted-foreground">{formatDate(customer.createdAt, locale)}</td>
                  <td className="text-muted-foreground">{customer.paidOrders}</td>
                  <td className="text-foreground">{formatCurrency(customer.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </>
      )}

      <Pagination
        t={t}
        page={page}
        totalPages={totalPages}
        buildHref={(target) =>
          `/admin/clientes?${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />
    </div>
  );
}
