import type { Metadata } from "next";
import { PolicyPage } from "@/components/policies/PolicyPage";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de compra en Glam Luxe by HJ: precios, precio mayorista, reservas, pagos y envíos.",
  alternates: { canonical: "/politicas/terminos" },
};

export default function TermsPage() {
  return (
    <PolicyPage
      href="/politicas/terminos"
      title="Términos y condiciones"
      intro="Las reglas claras de cómo compras en Glam Luxe by HJ. Al navegar el sitio o realizar un pedido, aceptas estos términos."
      sections={[
        {
          id: "aceptacion",
          title: "Aceptación de los términos",
          body: [
            "Estos términos regulan el uso del sitio y todas las compras realizadas en Glam Luxe by HJ. Al crear una cuenta o confirmar un pedido declaras haberlos leído y aceptado.",
            "Durante el proceso de compra te pedimos aceptar estos términos de forma expresa; guardamos la fecha y hora de esa aceptación junto con tu pedido.",
          ],
        },
        {
          id: "precios",
          title: "Productos y precios",
          body: [
            "Todos los precios se muestran en dólares estadounidenses (USD). Cada producto tiene un precio individual y un precio mayorista.",
            `El precio mayorista se aplica automáticamente cuando tu carrito suma ${WHOLESALE_ITEM_THRESHOLD} o más artículos, que pueden ser de distintos productos y tallas. Al alcanzarlo, el precio mayorista se aplica a todas las piezas del carrito.`,
            "Los precios pueden cambiar sin previo aviso, pero el precio de un pedido ya confirmado queda congelado y no se modifica después.",
          ],
        },
        {
          id: "pedidos",
          title: "Pedidos y reserva",
          body: [
            "Al confirmar tu pedido reservamos las piezas y su inventario durante 3 días mientras verificamos tu pago. El pedido no se considera confirmado hasta que el pago esté verificado.",
            "Si el pago no se confirma dentro de ese plazo, la reserva vence automáticamente y las piezas vuelven a estar disponibles para otros clientes.",
            "Nos reservamos el derecho de cancelar un pedido ante errores evidentes de precio o de inventario; en ese caso te avisaremos y, si ya pagaste, te reembolsaremos el importe completo.",
          ],
        },
        {
          id: "pagos",
          title: "Métodos de pago",
          body: [
            "Aceptamos tarjeta de crédito o débito, procesada por un proveedor de pagos certificado: no almacenamos los datos de tu tarjeta.",
            "También aceptamos Zelle, Cash App y PayPal. Estos pagos se verifican manualmente; tu pedido se confirma una vez comprobado el pago. Un pago rechazado o no verificable puede provocar la cancelación del pedido.",
          ],
        },
        {
          id: "envios",
          title: "Envíos",
          body: [
            "En compras al detalle, el costo de envío depende de la cantidad de artículos y se muestra en tu carrito antes de pagar.",
            "En pedidos con precio mayorista, el envío se coordina directamente contigo según el volumen y el destino.",
            "Los tiempos de entrega son estimados y pueden variar por causas ajenas a nosotros, como demoras de la empresa transportista.",
          ],
        },
        {
          id: "devoluciones",
          title: "Venta final",
          body: [
            "Todas las ventas son finales. La única excepción es el daño de fábrica reportado dentro de las primeras 24 horas desde la entrega, según nuestra Política de devoluciones.",
          ],
        },
        {
          id: "cuenta",
          title: "Tu cuenta",
          body: [
            "Eres responsable de mantener la confidencialidad de tu contraseña y de la actividad realizada con tu cuenta. Avísanos de inmediato si detectas un uso no autorizado.",
          ],
        },
        {
          id: "propiedad",
          title: "Propiedad intelectual",
          body: [
            "El nombre Glam Luxe by HJ, su logotipo, las fotografías y los textos del sitio son propiedad de la marca y no pueden usarse sin autorización escrita.",
          ],
        },
        {
          id: "cambios",
          title: "Cambios a estos términos",
          body: [
            "Podemos actualizar estos términos para reflejar cambios en nuestro servicio. La versión vigente es siempre la publicada en esta página, con su fecha de última actualización; los pedidos ya confirmados se rigen por los términos aceptados al comprar.",
          ],
        },
      ]}
    />
  );
}
