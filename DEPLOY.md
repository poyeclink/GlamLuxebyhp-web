# Despliegue a producción (Vercel)

Estado verificado el 2026-10-05: `pnpm build` y `pnpm lint` limpios, las 18 migraciones aplicadas en Supabase, y el build de producción (`pnpm start`) responde bien en todas las rutas públicas, protegidas y el cron.

## 1. Antes de subir

- [ ] Haz commit de todo, **incluidos los archivos nuevos**. Fíjate en estos dos, que no son código:
  - `prisma/migrations/20261005213752_order_locale/`: ya está aplicada en la base, pero tiene que quedar en el historial.
  - `public/brand/glamluxe-horizontal-email.png`: el logo de los correos. Sin él, los correos salen sin logo.
- [ ] Cambia la contraseña del admin: `CambiaEstaClave123` es la de plantilla. Pon una fuerte en `ADMIN_PASSWORD` de tu `.env` local y corre `pnpm db:seed`. Desarrollo y producción comparten la misma base de Supabase, así que el cambio aplica directo.
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
- [ ] Al conectar el dominio, carga `NEXT_PUBLIC_SITE_URL` y vuelve a desplegar: los enlaces de los correos, el sitemap y el canonical lo usan.

## 4. Cambios futuros de base de datos

Vercel **no** corre migraciones. Antes de desplegar un cambio de `prisma/schema.prisma`, aplica la migración desde tu máquina:

```bash
pnpm prisma migrate deploy
```

## 5. Pendientes conocidos (no bloquean el lanzamiento)

- **Pago con tarjeta (Stripe)**: todavía no está integrado. La tienda dice con honestidad que se habilitará pronto; hoy los pedidos se pagan por Zelle, Cash App o PayPal, verificados a mano.
- **Traducción al inglés**: el sitio sale en inglés por defecto, pero Cloudflare Workers AI agotó su cuota gratuita diaria (10,000 neurons). Mientras tanto, los textos nuevos aparecen en español. El plan Workers Paid (desde USD 5/mes) lo resuelve; lo ya traducido queda en caché.
- **Imágenes en `*.r2.dev`**: Cloudflare limita esa URL y no la recomienda para producción. Conecta un dominio propio al bucket (p. ej. `img.tudominio.com`) y actualiza `R2_PUBLIC_URL`; no hace falta migrar datos.
- **Cron diario**: el plan Hobby solo permite un cron al día. Un pedido vence entre 0 y 24 h después de sus 3 días de reserva; en Pro se puede pasar a cada hora (`vercel.json`).
- **Gmail**: permite unos 500 correos al día. Con más volumen conviene un proveedor transaccional (Resend, Postmark); solo habría que cambiar `src/lib/mailer.ts`.
