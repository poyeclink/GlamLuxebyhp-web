import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { PolicyPage } from "@/components/policies/PolicyPage";

export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    t("Política de devoluciones"),
    t("Venta final con garantía de daño de fábrica: cómo reportar una pieza defectuosa dentro de las primeras 24 horas."),
  ]);
  return { title, description, alternates: { canonical: "/politicas/devoluciones" } };
}

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      href="/politicas/devoluciones"
      title="Política de devoluciones"
      intro="Revisamos cada pieza antes de enviarla. Por eso nuestras ventas son finales, con una garantía clara ante cualquier daño de fábrica."
      sections={[
        {
          id: "venta-final",
          title: "Venta final",
          body: [
            "Todas las compras son finales: no aceptamos devoluciones ni cambios por talla, color o cambio de opinión. Te recomendamos revisar la descripción, las tallas disponibles y escribirnos ante cualquier duda antes de comprar.",
          ],
        },
        {
          id: "danio-fabrica",
          title: "Garantía por daño de fábrica",
          body: [
            "Si recibes una pieza con un defecto de fábrica —por ejemplo, costuras abiertas, cierres o herrajes defectuosos, manchas o roturas de origen— la resolvemos contigo.",
            "Para aplicar, debes reportarlo dentro de las primeras 24 horas desde que recibes tu pedido. Pasado ese plazo no podemos aceptar el reclamo.",
          ],
        },
        {
          id: "como-reportar",
          title: "Cómo reportarlo",
          body: [
            "Escríbenos desde la página de contacto indicando tu número de pedido, junto con fotos o un video donde se vea claramente el daño.",
            "La pieza debe estar sin usar, sin lavar y con sus etiquetas y empaque originales.",
          ],
        },
        {
          id: "solucion",
          title: "Qué solución recibes",
          body: [
            "Una vez verificado el daño, te ofrecemos reponer la pieza por una igual o, si no hay disponibilidad, un crédito o reembolso por el valor pagado por esa pieza.",
          ],
        },
        {
          id: "no-cubre",
          title: "Qué no cubre la garantía",
          body: [
            "No cubre desgaste por uso, daños por lavado o cuidado inadecuado, diferencias mínimas de tono por la pantalla de tu dispositivo, ni piezas reportadas fuera del plazo de 24 horas.",
          ],
        },
        {
          id: "mayoristas",
          title: "Pedidos mayoristas",
          body: [
            "Las mismas condiciones aplican a pedidos con precio mayorista. Te pedimos revisar todas las piezas al recibirlas y reportar cualquier daño de fábrica dentro del mismo plazo de 24 horas.",
          ],
        },
        {
          id: "cancelaciones",
          title: "Cancelaciones antes del pago",
          body: [
            "Mientras tu pedido esté pendiente de pago, puedes cancelarlo desde “Mis pedidos” y no se te cobra nada. Si no completas el pago, se cancela solo.",
          ],
        },
      ]}
    />
  );
}
