import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { PolicyPage } from "@/components/policies/PolicyPage";

export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    t("Política de privacidad"),
    t("Qué datos recopila Glam Luxe by HJ, para qué los usamos, con quién los compartimos y cómo ejercer tus derechos."),
  ]);
  return { title, description, alternates: { canonical: "/politicas/privacidad" } };
}

export default function PrivacyPage() {
  return (
    <PolicyPage
      href="/politicas/privacidad"
      title="Política de privacidad"
      intro="Tu confianza es parte de lo que vendemos. Aquí te explicamos, sin rodeos, qué datos usamos y cómo los protegemos."
      sections={[
        {
          id: "datos",
          title: "Datos que recopilamos",
          body: [
            "Cuando creas una cuenta o haces un pedido guardamos tu nombre, correo electrónico, número de WhatsApp, las direcciones de envío que registras y el historial de tus pedidos.",
            "Los datos de tu tarjeta los procesa directamente nuestro proveedor de pagos certificado; nunca pasan por nuestros servidores ni los almacenamos.",
          ],
        },
        {
          id: "uso",
          title: "Para qué los usamos",
          body: [
            "Usamos tus datos únicamente para procesar y entregar tus pedidos, verificar pagos, comunicarnos contigo sobre tus compras y prevenir fraudes.",
            "No enviamos publicidad sin tu consentimiento y nunca vendemos tu información.",
          ],
        },
        {
          id: "cookies",
          title: "Cookies",
          body: [
            "Usamos solo cookies necesarias para que el sitio funcione: una para mantener tu sesión iniciada, otra para recordar tu carrito si compras sin cuenta y otra para recordar tu idioma.",
            "No usamos cookies de publicidad ni de rastreo de terceros.",
          ],
        },
        {
          id: "terceros",
          title: "Con quién los compartimos",
          body: [
            "Compartimos la información mínima necesaria con proveedores que nos ayudan a operar: el procesador de pagos, el servicio de alojamiento del sitio y de imágenes, y la empresa de envío que entrega tu pedido.",
            "Estos proveedores solo pueden usar tus datos para prestarnos ese servicio.",
          ],
        },
        {
          id: "seguridad",
          title: "Cómo protegemos tus datos",
          body: [
            "Tu contraseña se guarda cifrada con un algoritmo de un solo sentido: ni siquiera nosotros podemos leerla. Todas las conexiones con el sitio viajan cifradas.",
          ],
        },
        {
          id: "derechos",
          title: "Tus derechos",
          body: [
            "Puedes consultar y corregir tus datos y direcciones en cualquier momento desde tu perfil. Si quieres que eliminemos tu cuenta y tus datos personales, escríbenos desde la página de contacto.",
            "Conservamos el registro de pedidos ya realizados el tiempo que exijan nuestras obligaciones contables y legales.",
          ],
        },
        {
          id: "cambios",
          title: "Cambios a esta política",
          body: [
            "Si cambiamos la forma en que tratamos tus datos, actualizaremos esta página y su fecha de última actualización.",
          ],
        },
      ]}
    />
  );
}
