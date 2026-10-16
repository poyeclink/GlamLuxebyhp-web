# Despliegue a producción (Vercel)

Estado verificado el 2026-10-05: `pnpm build` y `pnpm lint` limpios, las 18 migraciones aplicadas en Supabase, y el build de producción (`pnpm start`) responde bien en todas las rutas públicas, protegidas y el cron.

## 1. Antes de subir

- [ ] Haz commit de todo, **incluidos los archivos nuevos**. Fíjate en estos dos, que no son código:
  - `prisma/migrations/20261005213752_order_locale/`: ya está aplicada en la base, pero tiene que quedar en el historial.
  - `public/brand/glamluxe-horizontal-email.png`: el logo de los correos. Sin él, los correos salen sin logo.
- [ ] Cambia la contraseña del admin: `CambiaEstaClave123` es la de plantilla. Pon una fuerte en `ADMIN_PASSWORD` de tu `.env` local y corre `pnpm db:seed`. Desarrollo y producción comparten la misma base de Supabase, así que el cambio aplica directo.
- [ ] Cambios de disponibilidad (oct 2026): incluye en el commit `prisma/migrations/20261012180000_availability_flags/` (ya aplicada en la base) y el borrado de `src/app/(admin)/admin/inventario/[variantId]/` y `src/components/admin/AdjustStockForm.tsx`. Hasta que se despliegue, producción sigue con el código viejo de stock.
- [x] Cuenta del cliente demo borrada de la base y `DEMO_CUSTOMER_*` vaciadas en el `.env` (2026-10-05).

## 2. Proyecto en Vercel

1. Importa el repo `poyeclink/GlamLuxebyhp-web`. Vercel detecta Next.js y pnpm solo; el build usa el script `build` (`prisma generate && next build`).
2. La región (`pdx1`, junto a la base) y el cron diario de pedidos vencidos ya vienen en `vercel.json`.
3. Carga las variables en **Settings → Environment Variables** (Production). Para los secretos, genera valores **nuevos** (no reutilices los de desarrollo):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variable | Valor en producción |
|---|---|
| `DATABASE_URL` | La misma del `.env` (pooler, puerto 6543) |
| `AUTH_SECRET` | **Nuevo** (comando de arriba) |
| `SESSION_COOKIE_NAME` | `glamluxe_session` |
| `CRON_SECRET` | **Nuevo** (comando de arriba) |
| `STRIPE_SECRET_KEY` | Clave secreta **live** (`sk_live_…`) de la cuenta de la clienta — ver sección 4 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` del endpoint **live** de producción — ver sección 4 |
| `NEXT_PUBLIC_SITE_URL` | El dominio final, con `https://` y sin `/` final. Hasta tener dominio puede quedar vacío (usa la URL `*.vercel.app`) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Los mismos del `.env` |
| `CLOUDFLARE_API_TOKEN` | El mismo del `.env` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Los mismos del `.env` (Gmail + contraseña de aplicación) |
| `ADMIN_NOTIFY_EMAIL`, `MAIL_FROM` | Opcionales (ver `.env.example`) |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_*_URL` (redes) | Opcionales: si quedan vacías, ese canal no se muestra |

**No** hace falta cargar en Vercel `DIRECT_URL`, `ADMIN_*` ni `DEMO_*`: solo los usan el CLI de Prisma y el seed, en tu máquina.

> Las `NEXT_PUBLIC_*` se fijan al compilar: si cambias una, vuelve a desplegar.

## 3. Después del primer despliegue

- [ ] Abre la Home, `/tienda`, un producto y `/contacto`.
- [ ] Entra a `/acceso-admin` con la contraseña nueva.
- [ ] Pide una recuperación de contraseña en `/recuperar` con tu correo y revisa que llegue el correo, con el logo.
- [ ] Envía un mensaje de prueba desde `/contacto`: debe llegar a `ADMIN_NOTIFY_EMAIL` (o, si está vacío, a `SMTP_USER`).
- [ ] En Vercel → **Settings → Cron Jobs**, confirma que aparece `/api/cron/expire-orders`.
- [ ] Stripe en modo real: sección 4.
- [ ] Al conectar el dominio, carga `NEXT_PUBLIC_SITE_URL` y vuelve a desplegar: los enlaces de los correos, el sitemap y el canonical lo usan.

## 4. Stripe en modo real (cobros de verdad)

El código ya está listo: el cobro es con **Stripe Checkout** (página de pago alojada por Stripe, la tarjeta nunca pasa por nuestro servidor) y el pedido se confirma **solo** por el webhook. Solo hay que configurar la cuenta y cargar dos variables.

### 4.1 En el panel de Stripe (cuenta de la clienta, modo **live**: interruptor "Test mode" apagado)

- [ ] **Activar la cuenta**: datos del negocio, identidad y la **cuenta bancaria** para recibir los pagos. Hasta terminarlo, Stripe no deja cobrar en modo live.
- [ ] **Settings → Public details**: nombre público `Glam Luxe by HJ`, correo y teléfono de atención, y el **statement descriptor** (lo que ve el cliente en su estado de cuenta), p. ej. `GLAMLUXE BY HJ`.
- [ ] **Settings → Branding**: logo/ícono (`public/brand/glamluxe-isotipo-color-oscuro.svg` exportado a PNG), color de marca `#0A0A0B` y de acento `#1B6FB8`. Es lo que se ve en la página de pago.
- [ ] **Settings → Payment methods**: deja activas **tarjetas**, **Apple Pay** y **Google Pay** (y Link si se quiere). **No** actives métodos de confirmación diferida (ACH Direct Debit, transferencias bancarias…): el pedido pendiente solo dura 32 minutos y un pago que se confirma días después llegaría a un pedido ya vencido y se reembolsaría solo.
- [ ] **Developers → API keys**: copia la **Secret key** live (`sk_live_…`). No la pegues en el `.env` local.
- [ ] **Developers → Webhooks → Add endpoint**:
  - URL: `https://glam-luxebyhp-web.vercel.app/api/stripe/webhook` (o el dominio final).
  - Eventos (solo estos 3): `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`.
  - Guarda y copia el **Signing secret** (`whsec_…`) de **ese** endpoint.

### 4.2 En Vercel

- [ ] **Settings → Environment Variables**, solo en **Production** (no en Preview: un preview cobraría de verdad sobre la misma base):
  - `STRIPE_SECRET_KEY` = la `sk_live_…`
  - `STRIPE_WEBHOOK_SECRET` = el `whsec_…` del endpoint live
- [ ] **Deployments → Redeploy** del último despliegue de producción (las variables nuevas solo se aplican al volver a desplegar).
- [ ] Comprobación rápida, sin secretos: `curl -X POST https://<dominio>/api/stripe/webhook` debe responder **400 "Firma inválida"**. Si responde **503 "Stripe no configurado"**, falta alguna de las dos variables o no se redesplegó.

### 4.3 Prueba real (con una tarjeta propia)

- [ ] Con una cuenta de cliente, compra el producto más barato hasta pagar en Stripe.
- [ ] El pedido debe pasar solo a **Confirmado** (en `/pedidos/<id>` y en el admin) y deben llegar el correo de confirmación al cliente y el de "pedido nuevo" al admin. En Stripe → **Developers → Webhooks → (endpoint)** los eventos deben aparecer con respuesta `200`.
- [ ] Desde el admin, **cancela** ese pedido: se reembolsa solo. Verifica el reembolso en Stripe → **Payments**. (Stripe no devuelve su comisión de un cobro reembolsado.)

### 4.4 Para el día a día

- Reembolsos y cancelaciones: siempre **desde el admin** (cancelar pedido). Un reembolso hecho directo en el panel de Stripe no cambia el estado del pedido en la tienda.
- Disputas/contracargos se gestionan en el panel de Stripe; la tienda no se entera.
- Si cambia el dominio: agrega el nuevo endpoint en Stripe (y su `whsec_…` en Vercel), actualiza `NEXT_PUBLIC_SITE_URL` y vuelve a desplegar.
- **Desarrollo y producción comparten la base**: con Stripe en modo prueba en local, un checkout hecho en local crea pedidos **reales** en el admin de producción (y con `stripe listen` hasta pueden quedar "Confirmados" y mandar correos). Después del lanzamiento, no hagas compras de prueba en local salvo con una base de desarrollo aparte.

## 5. Cambios futuros de base de datos

Vercel **no** corre migraciones. Antes de desplegar un cambio de `prisma/schema.prisma`, aplica la migración desde tu máquina:

```bash
pnpm prisma migrate deploy
```

## 6. Pendientes conocidos (no bloquean el lanzamiento)

- **Traducción al inglés**: el sitio sale en inglés por defecto, pero Cloudflare Workers AI agotó su cuota gratuita diaria (10,000 neurons). Mientras tanto, los textos nuevos aparecen en español. El plan Workers Paid (desde USD 5/mes) lo resuelve; lo ya traducido queda en caché.
- **Imágenes en `*.r2.dev`**: Cloudflare limita esa URL y no la recomienda para producción. Conecta un dominio propio al bucket (p. ej. `img.tudominio.com`) y actualiza `R2_PUBLIC_URL`; no hace falta migrar datos.
- **Cron diario**: solo es respaldo. Si Stripe no logra avisar que venció un pago, ese pedido pasa a "Pago no completado" (y sus piezas vuelven al carrito del cliente) en la corrida diaria del cron.
- **Gmail**: permite unos 500 correos al día. Con más volumen conviene un proveedor transaccional (Resend, Postmark); solo habría que cambiar `src/lib/mailer.ts`.
