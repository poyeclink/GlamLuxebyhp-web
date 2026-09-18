import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  ORDER_STATUS_BADGE_VARIANT,
  getOrderStatusCounts,
  listRecentOrders,
} from "@/server/services/order-service";
import { listLowStockVariants } from "@/server/services/product-variant-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

// Plural porque son encabezados de tarjeta ("Reservados: 3"), a diferencia de
// ORDER_STATUS_LABELS (singular, para un badge de un solo pedido) — no vale
// la pena compartir un mapa para esta única diferencia de forma gramatical.
const STATUS_CARD_LABELS: Record<OrderStatus, string> = {
  reservado: "Reservados",
  confirmado: "Confirmados",
  enviado: "Enviados",
  cancelado: "Cancelados",
  vencido: "Vencidos",
};

export default async function AdminHomePage() {
  const [session, statusCounts, recentOrders, lowStockVariants] = await Promise.all([
    getSession(),
    getOrderStatusCounts(),
    listRecentOrders(10),
    listLowStockVariants(10),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Panel administrativo</h1>
        <p className="text-muted-foreground">Sesión iniciada como {session?.name}.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(STATUS_CARD_LABELS) as OrderStatus[]).map((status) => (
          <Card key={status}>
            <CardContent className="flex flex-col gap-1 p-4">
              <span className="text-sm text-muted-foreground">{STATUS_CARD_LABELS[status]}</span>
              <span className="text-2xl font-semibold text-foreground">
                {statusCounts[status]}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ventas recientes</CardTitle>
            <Link href="/admin/pedidos" className="text-sm text-muted-foreground hover:text-foreground">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay pedidos.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="flex flex-col gap-0.5 text-sm hover:underline"
                    >
                      <span className="font-medium text-foreground">{order.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground">
                        {formatCurrency(Number(order.total))}
                      </span>
                      <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>{order.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alertas de stock bajo</CardTitle>
            <Link href="/admin/inventario" className="text-sm text-muted-foreground hover:text-foreground">
              Ver inventario
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {lowStockVariants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ninguna talla está por debajo del umbral de stock bajo.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {lowStockVariants.map((variant) => (
                  <li key={variant.id} className="flex items-center justify-between gap-4 py-3">
                    <Link
                      href={`/admin/inventario/${variant.id}`}
                      className="flex flex-col gap-0.5 text-sm hover:underline"
                    >
                      <span className="font-medium text-foreground">{variant.product.name}</span>
                      <span className="text-xs text-muted-foreground">Talla {variant.size}</span>
                    </Link>
                    <Badge variant={variant.stock === 0 ? "destructive" : "secondary"}>
                      {variant.stock} en stock
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
