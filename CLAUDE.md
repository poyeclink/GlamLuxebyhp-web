# GlamLuxeByHp — Convenciones del proyecto

E-commerce mayorista/minorista (marca blanca, sin estética definida todavía).
Stack obligatorio: Next.js (App Router) + TypeScript + React + Prisma + Supabase PostgreSQL + Cloudflare R2 + Stripe + Vercel + pnpm.

## Estado actual

- Sin branding/paleta de colores definida todavía: no introducir colores de marca, logo ni tokens de color personalizados. Sí construir componentes de UI **interactivos y profesionales** (Tailwind con paleta neutra por defecto, shadcn/ui donde aplique) — la calidad de interacción y estructura visual no espera a que exista una identidad de marca, solo el color/branding específico.
- Ver `IMPLEMENTATION_PLAN.md` (generado en la conversación de planificación) para fases y tickets.
- Por ahora se trabaja sin MCPs adicionales (Prisma MCP u otros) — todo vía CLI/herramientas estándar.

## Cómo trabajar en este repo (para minimizar tokens y maximizar calidad)

- **Código mínimo y sin sobreingeniería**: usar el enfoque de la skill `ponytail` por defecto en toda tarea de código (escribir, refactorizar, revisar). Nada de abstracciones especulativas, capas sin propósito, ni flags de compatibilidad hacia atrás en un proyecto que aún no tiene usuarios.
- **Exploración amplia del código → subagente**: cualquier búsqueda que tome más de 2-3 llamadas a Grep/Glob debe delegarse al agente `Explore` en vez de hacerse inline, para no inflar el contexto principal.
- **Antes de cerrar un ticket de código**: correr la skill `code-review` (o `simplify` si es solo limpieza) sobre el diff antes de darlo por terminado.
- **Sin comentarios explicativos** de qué hace el código (los nombres ya lo dicen); solo comentarios que expliquen un porqué no obvio.
- **Sí construir UI**, incluyendo componentes interactivos (modales, dropdowns, tabs, formularios con estados de carga/error, etc.) a medida que avanzan los tickets — lo único que se pospone es branding: colores de marca, logo y tokens de color personalizados.
- Server Components por defecto; Client Components solo donde hay interactividad real (carrito, checkout, formularios admin, Stripe Elements).
- Lógica de negocio (pricing mayorista, envío por tramos, máquina de estados de pedido) vive en `src/server/services/`, pura y testeable, no en Server Actions ni componentes.

## Base de datos (Prisma 7 + Supabase)

- Prisma pinneado a `7.10.0` (versión estable) a propósito — el tag `latest` de npm apunta a un release candidate de Prisma 8, no usarlo hasta que sea estable.
- Config del CLI en `prisma7.config.ts` (ese es el nombre que esta versión de Prisma detecta automáticamente, no `prisma.config.ts`). Ahí solo vive `DIRECT_URL` porque el CLI (migrate/db push/studio) la necesita.
- `DIRECT_URL` usa el **Session pooler** de Supabase (`aws-0-<region>.pooler.supabase.com:5432`), no el host de conexión directa real (`db.<project-ref>.supabase.co:5432`) — ese host solo resuelve por IPv6 y da `ETIMEDOUT` en redes/entornos sin salida IPv6 (verificado en desarrollo). El Session pooler soporta prepared statements igual que una conexión directa, así que sirve para migraciones sin ese problema.
- La app en runtime (`src/lib/prisma.ts`) usa `DATABASE_URL` (conexión pooled vía Supavisor/PgBouncer) directamente en el `PrismaPg` adapter — **no** pasa por `prisma7.config.ts`. El tipo `Datasource` de esta versión no tiene campo `directUrl`, por eso están separados así.
- Prisma 7 requiere **driver adapters** (no hay motor de query engine binario): usamos `@prisma/adapter-pg` + `pg`. El cliente generado no vive en `node_modules`, sino en `src/generated/prisma` (gitignored) — se importa como `@/generated/prisma/client` (el archivo `client.ts`, la carpeta no tiene `index`).
- Correr `pnpm db:generate` después de cualquier cambio en `prisma/schema.prisma`.

## Autenticación

- Sesión propia: JWT (librería `jose`, edge-safe) en cookie httpOnly (`src/lib/session.ts`), sin tabla de sesiones en DB. Contraseñas con `bcryptjs` (`src/lib/password.ts`).
- Cliente y administrador comparten el modelo `User` (`role`), pero tienen flujos y rutas completamente separados: `/login` + `/registro` (cliente, con auto-registro) vs. `/acceso-admin` (admin, sin auto-registro — se crea vía `pnpm db:seed` con `ADMIN_EMAIL`/`ADMIN_PASSWORD` en `.env`).
- `src/proxy.ts` protege `/admin/:path*` (requiere `role administrador`, si no redirige a `/acceso-admin`). En Next.js 16 el archivo se llama `proxy.ts` y la función `proxy`, no `middleware.ts`/`middleware` — ese nombre está deprecado desde v16. Corre en runtime Node.js por defecto (ya no Edge).
- Los Server Actions de auth siempre devuelven el mismo mensaje genérico ("Correo o contraseña incorrectos") sin importar si el correo no existe, la contraseña es incorrecta, o el usuario tiene el rol equivocado para ese formulario — evita filtrar qué cuentas existen o son admin.

## Design system (`src/components/ui/`)

- Tokens de color/radio en `src/app/globals.css` como variables CSS (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--border`, `--input`, `--ring`, `--destructive`, `--radius`) mapeadas a utilidades de Tailwind v4 vía `@theme inline` (ej. `--color-primary` → clases `bg-primary`/`text-primary`). Paleta neutra (grises) a propósito — cuando se defina la marca, el rebranding es cambiar estos valores en un solo lugar, no tocar cada componente.
- **Nunca usar clases `neutral-*`/`gray-*`/colores literales de Tailwind directamente en componentes** — siempre los tokens semánticos (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, etc.), para que el rebranding futuro no requiera tocar componentes.
- Variantes de componentes con `class-variance-authority` (`cva`) + `cn()` (`clsx` + `tailwind-merge`, en `src/lib/utils.ts`) — mismo patrón que usa shadcn/ui, así cualquier componente de shadcn se puede copiar/pegar directo sin reajustar tokens.
- Primitivos disponibles: `Button` (variants primary/secondary/outline/ghost/destructive, prop `loading` con spinner), `Input`, `Label`, `TextField` (Label+Input), `Card`/`CardHeader`/`CardTitle`/`CardContent`/`CardFooter`, `Badge`, `FormError`, `SubmitButton` (wrapper de `Button` con `useFormStatus`), `PriceDual` (precio mayorista + individual, patrón de negocio del PDF).

## Referencia rápida de reglas de negocio (fuente: PDF de análisis)

- Precio mayorista automático a partir de 6 artículos en el carrito (umbral configurable, no hardcodear el número 6 dos veces).
- Envío por tramos a nivel individual: $10 (1–2 artículos), $35 (3–5).
- Pedido se reserva 3 días; no se confirma hasta verificar el pago.
- Pago con tarjeta = Stripe (automático); Zelle/Cash App/PayPal = verificación manual por admin.
- Venta final: sin devoluciones salvo daño de fábrica reportado en 24h.
- Autenticación de cliente y de administrador son flujos y rutas separadas (`/login` vs `/acceso-admin`).
