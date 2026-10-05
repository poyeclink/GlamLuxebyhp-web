import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import { getOrderStatusCounts, listRecentOrders } from "@/server/services/order-service";
import { listLowStockVariants } from "@/server/services/product-variant-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

// Plural porque son encabezados de tarjeta ("Reservados: 3"), a diferencia de
// ORDER_STATUS_LABELS (singular, para un badge de un solo pedido) — no vale
// la pena compartir un mapa para esta única diferencia de forma gramatical.
const STATUS_CARDS: { status: OrderStatus; label: string; hint: string; icon: string }[] = [
  {
    status: "reservado",
    label: "Reservados",
    hint: "Esperando verificación de pago",
    icon: "hourglass_top",
  },
  { status: "confirmado", label: "Confirmados", hint: "Listos para preparar", icon: "task_alt" },
  { status: "enviado", label: "Enviados", hint: "En camino al cliente", icon: "local_shipping" },
  { status: "cancelado", label: "Cancelados", hint: "Pago rechazado", icon: "block" },
  { status: "vencido", label: "Vencidos", hint: "Reserva expirada", icon: "event_busy" },
];

const QUICK_LINKS = [
  { href: "/admin/productos/nuevo", label: "Nuevo producto", icon: "add_box" },
  { href: "/admin/categorias", label: "Categorías", icon: "category" },
  { href: "/admin/inventario", label: "Inventario", icon: "warehouse" },
  { href: "/admin/reportes", label: "Reportes PDF", icon: "picture_as_pdf" },
];

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group -my-2.5 -mr-2 flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-accent transition-colors hover:text-foreground active:bg-accent-soft"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export default async function AdminHomePage() {
  const [session, statusCounts, recentOrders, lowStockVariants] = await Promise.all([
    getSession(),
    getOrderStatusCounts(),
    listRecentOrders(8),
    listLowStockVariants(8),
  ]);
  const firstName = (session?.name ?? "Administrador").split(" ")[0];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-10 sm:px-8 sm:py-10 lg:py-12">
      <AdminPageHeader
        eyebrow={formatDate(new Date())}
        title={`Hola, ${firstName}`}
        description="Este es el resumen de tu tienda: pedidos por estado, ventas recientes y tallas por reponer."
        action={
          <Link href="/admin/productos/nuevo">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo producto
            </Button>
          </Link>
        }
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {STATUS_CARDS.map(({ status, label, hint, icon }, index) => {
          const featured = index === 0;
          return (
            <li key={status} className={cn(featured && "col-span-2 sm:col-span-1")}>
              <Link
                href={`/admin/pedidos?estado=${status}`}
                className={cn(
                  "group flex h-full items-center gap-3 rounded-2xl border p-3.5 hover-lift hover:shadow-[0_20px_40px_-24px_rgba(10,10,11,0.45)] active:opacity-80 sm:flex-col sm:items-stretch sm:gap-6 sm:p-5",
                  featured
                    ? "border-inverse bg-inverse text-inverse-foreground"
                    : "border-border bg-background text-foreground hover:border-foreground/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10",
                      featured
                        ? "bg-inverse-accent/15 text-inverse-accent"
                        : "bg-accent-soft text-accent",
                    )}
                  >
                    <span
                      className="material-symbols-outlined text-[20px] leading-none"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                  </span>
                  <ArrowUpRight
                    className={cn(
                      "hidden h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block",
                      featured ? "text-inverse-accent" : "text-accent",
                    )}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
                  <span className="text-2xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl">
                    {statusCounts[status]}
                  </span>
                  <span className="truncate text-xs font-medium sm:text-sm">{label}</span>
                  <span
                    className={cn(
                      "text-xs",
                      featured ? "text-inverse-muted" : "hidden text-muted-foreground sm:block",
                    )}
                  >
                    {hint}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4 sm:p-6">
            <CardTitle>Ventas recientes</CardTitle>
            <CardLink href="/admin/pedidos">Ver todos</CardLink>
          </CardHeader>
          <CardContent className="p-2">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Todavía no hay pedidos.</p>
            ) : (
              <ul className="flex flex-col">
                {recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="flex min-h-14 items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent-soft/50 active:bg-accent-soft sm:gap-4 sm:px-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-foreground">
                        {order.fullName.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {order.fullName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1 sm:flex-row-reverse sm:items-center sm:gap-4">
                        <span className="text-sm font-medium text-foreground sm:w-20 sm:text-right">
                          {formatCurrency(Number(order.total))}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4 sm:p-6">
              <CardTitle>Stock bajo</CardTitle>
              <CardLink href="/admin/inventario">Inventario</CardLink>
            </CardHeader>
            <CardContent className="p-2">
              {lowStockVariants.length === 0 ? (
                <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                  <span className="material-symbols-outlined text-accent" aria-hidden="true">
                    verified
                  </span>
                  Ninguna talla está por debajo del umbral de stock bajo.
                </div>
              ) : (
                <ul className="flex flex-col">
                  {lowStockVariants.map((variant) => (
                    <li key={variant.id}>
                      <Link
                        href={`/admin/inventario/${variant.id}`}
                        className="flex min-h-14 items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent-soft/50 active:bg-accent-soft sm:gap-4 sm:px-4"
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {variant.product.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Talla {variant.size}
                          </span>
                        </span>
                        <Badge variant={variant.stock === 0 ? "destructive" : "secondary"}>
                          {variant.stock === 0 ? "Agotado" : `${variant.stock} en stock`}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-inverse text-inverse-foreground">
            <CardHeader>
              <CardTitle>Accesos rápidos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col gap-3 rounded-xl border border-inverse-border p-4 text-sm transition-colors duration-300 hover:border-inverse-accent/60 hover:bg-inverse-border/40 active:bg-inverse-border/60"
                >
                  <span
                    className="material-symbols-outlined text-[22px] leading-none text-inverse-accent transition-transform duration-300 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  >
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
