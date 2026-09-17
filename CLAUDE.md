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

## Layout y navegación

- `src/app/(shop)/layout.tsx` envuelve todas las rutas de tienda (Home, login, registro, y las que vengan: tienda, producto, carrito, checkout, perfil, about, contacto, políticas) con `SiteHeader` + `SiteFooter`. `(admin)` (acceso-admin, admin) es una superficie aparte, sin este layout ni el header/footer de la tienda — a propósito, según el PDF.
- `SiteHeader` es Server Component (lee `getSession()` para mostrar "Mi cuenta"+logout o "Iniciar sesión"); el toggle del menú móvil vive aparte en `MobileNav` (Client Component) porque es la única parte que necesita estado en el cliente.
- Como el header depende de `getSession()` (usa `cookies()`), todas las rutas bajo `(shop)` son dinámicas (`ƒ` en el build), no estáticas — esperado, no es un bug.
- Contacto de WhatsApp en el footer es opcional vía `NEXT_PUBLIC_WHATSAPP_NUMBER`: si no está configurado, el link simplemente no se renderiza (no hay número real todavía).

## Cloudflare R2 (imágenes de producto)

- Cliente S3-compatible en `src/lib/r2.ts` (`@aws-sdk/client-s3`), configurado con el endpoint `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` y `region: "auto"`.
- Las subidas son siempre **server-side** (Server Actions del panel admin, ticket #11) usando `PutObjectCommand` directo — no se usan URLs firmadas ni upload desde el cliente, así que no hace falta configurar CORS en el bucket.
- `R2_PUBLIC_URL` es el dominio público desde el que se sirven los objetos (custom domain o `*.r2.dev`) — `r2PublicUrl(key)` arma la URL final; nunca se construye a mano en los componentes.
- Estructura de keys: `products/{productId}/{uuid}-{filename-sanitizado}` (`src/server/services/product-image-service.ts`, función `buildKey`).
- `ProductImage` guarda solo `key` (no `url`) — la URL pública siempre se deriva con `r2PublicUrl(key)` al leer, nunca se persiste. Así, si cambia `R2_PUBLIC_URL` (ej. de `*.r2.dev` a un dominio propio), no hay que migrar datos.
- Una sola `isPrimary: true` por producto no está forzado a nivel de base de datos (requeriría un índice único parcial que Prisma no modela bien) — se garantiza en `setPrimaryProductImage` (transacción: desmarca todas las del producto, marca la elegida) y en `addProductImage`/`deleteProductImage` (la primera imagen subida es primaria por defecto; al borrar la primaria se promueve la siguiente por `position`).
- Validación de imágenes: solo `image/jpeg|png|webp`, máx. 5MB (`assertValidImageFile`) — valida el MIME que reporta el navegador, no magic bytes; suficiente para un panel admin de bajo riesgo, no para un endpoint público.
- Todos los Server Actions de admin verifican `role administrador` al inicio con `requireAdmin()` (`src/lib/session.ts`) — es la única defensa real, la protección de `/admin/*` en `proxy.ts` no alcanza a un Server Action si se invocara desde otro lado. Reusar este helper en cada Server Action de admin nueva, no reescribirlo.
- `ProductImageUploader` (`src/components/admin/ProductImageUploader.tsx`) es el componente reutilizable para subir/reemplazar/borrar/marcar-principal — pensado para que el ticket #13 (CRUD de productos) lo monte directamente en el formulario de producto, recibiendo `images` ya con `url` calculada por el Server Component padre (nunca se expone `R2_PUBLIC_URL` al cliente).
- `next.config.ts` lee `R2_PUBLIC_URL` en build/dev time para autorizar ese host en `images.remotePatterns` (necesario para usar `next/image` con las imágenes de R2) — si cambian de dominio público, no hay que tocar el config, se recalcula solo.

## Panel admin: CRUD (categorías, y patrón para productos/etc. en adelante)

- `/admin/categorias` sigue el patrón estándar de CRUD admin de este proyecto: página lista (Server Component) + `/nueva` y `/[id]/editar` con un `CategoryForm` compartido (Client Component con `useActionState`) que recibe la Server Action ya bindeada (`updateCategoryAction.bind(null, id)`).
- Ticket #12 reinterpretó "eliminar (soft si tiene productos)" del plan original: en vez de agregar un campo `active` a `Category` (no existía y no hacía falta), el borrado simplemente se **bloquea con un mensaje claro** si tiene productos asociados (ya lo protege el `onDelete: Restrict` del ticket #8 a nivel de FK; el service pre-valida para dar un mensaje amigable con el conteo, en vez de dejar que reviente el constraint).
- Auto-generación de slug (`CategoryForm`) desde el nombre, pero **solo al crear** — al editar, el slug ya existente no se debe regenerar solo por tocar el nombre (se detectó y arregló este bug real durante la verificación: cambiar el nombre en modo edición estaba pisando el slug).
- `src/app/(admin)/admin/layout.tsx` es la nav mínima compartida de todo `/admin/*` (links + logout) — cada ticket nuevo de admin solo agrega su link ahí, no repite header/logout.
- `eslint.config.mjs` tiene `argsIgnorePattern`/`varsIgnorePattern: "^_"` para `no-unused-vars` — parámetros de Server Actions no usados (como `_prevState` cuando la action no necesita leer el estado previo) se prefijan con `_` y no generan warning.
- CRUD de productos (`/admin/productos`) sigue exactamente el mismo patrón que categorías, con dos diferencias: (1) `ProductForm` recibe la lista de categorías como prop (Server Component la carga) para el `SelectField`; (2) la página de editar producto monta además `ProductImageUploader` (ticket #11) debajo del formulario — las imágenes solo se gestionan una vez el producto existe (tiene `id`), nunca en el formulario de creación.
- `deleteProduct` (`product-service.ts`) borra primero los objetos de R2 de todas las imágenes del producto (reutilizando `deleteFromR2`, exportado desde `product-image-service.ts`) y luego borra el `Product` — el cascade de Prisma limpia las filas de `ProductImage`/`ProductVariant`, pero nunca toca R2, así que ese paso manual es obligatorio o quedan objetos huérfanos en el bucket.
- Primitivos de UI nuevos: `Textarea`, `Select`, `SelectField` (Label+Select, mismo patrón que `TextField`), `Checkbox` (input+label a la derecha). Igual que el resto del design system, solo tokens semánticos, cero colores hardcodeados.
- `VariantManager` (ticket #14, en la página de editar producto) gestiona tallas/stock con una fila por variante, cada una con su propio `useActionState` (patrón `VariantRow`, igual que `ProductImageCard` del ticket #11) — permite editar stock/talla o borrar sin afectar el estado de las demás filas. La gestión de variantes se muestra **siempre** en la página de editar, sin importar si el checkbox "Tiene variantes de talla" está marcado — ese flag es solo informativo para el storefront (tickets #17/#19), no condiciona si el admin puede cargar tallas.
- Duplicar una talla para el mismo producto se bloquea con mensaje claro (`assertSizeAvailable` en `product-variant-service.ts`), mismo patrón de pre-validación que categorías/productos en vez de dejar reventar el `@@unique([productId, size])`.

## Tienda pública (`src/app/(shop)/`)

- Home (ticket #15) muestra "categorías destacadas" y "productos destacados" sin curación manual todavía: `listFeaturedCategories` (`category-service.ts`) = categorías con productos activos ordenadas por cantidad de productos activos (desc) y nombre como desempate; `listFeaturedProducts` (`product-service.ts`) = productos activos más recientes (`createdAt` desc, `id` desc como desempate). Si más adelante se necesita curación real (ej. un checkbox "destacar" en el admin), se agrega un campo explícito — no inferir featured de otra señal.
- `Product.createdAt` (`@default(now())`) se agregó en el ticket #15 solo para poder ordenar "más reciente primero"; los productos creados antes de esa migración comparten el mismo timestamp de backfill, por eso el `orderBy` tiene `id` como desempate.
- `listFeaturedCategories` no puede pedirle a Prisma que ordene por un `_count` ya filtrado (activo únicamente) a nivel de base de datos — Prisma solo soporta `orderBy` sobre el conteo total de la relación — así que trae un lote acotado (`take: Math.max(limit * 5, 50)`) y ordena/recorta en JS. No "simplificar" esto a un `orderBy: { products: { _count: 'desc' } }` en Prisma: cambiaría el criterio a "más productos totales" en vez de "más productos activos".
- `src/components/shop/CategoryCard.tsx` y `ProductCard.tsx` enlazan a `/tienda` y `/producto/[slug]`; `/producto/[slug]` sigue pendiente (ticket #17) — 404 esperado hasta completarlo, mismo patrón de referencia hacia adelante que `VariantManager` con #17/#19.
- `/tienda` (ticket #16) lista productos activos con filtro opcional `?categoria={slug}`. `listShopCategories` (`category-service.ts`) solo trae categorías con productos activos, sin conteo — a diferencia de `listFeaturedCategories`, no necesita el workaround de ordenar en JS porque el filtro de tienda no rankea, solo lista. `toProductCardItem` (`product-service.ts`) es el mapeo compartido de un `Product` con `category`+`images` incluidos hacia las props de `ProductCard`; vive en el service (no en el componente) para que `ProductCard.tsx` no importe `r2PublicUrl`/el cliente de R2 — si un componente cliente futuro reusa `ProductCard`, no arrastra el SDK de S3 al bundle del navegador.
- Un slug de categoría inválido o sin productos activos en `/tienda?categoria=X` no se trata como "sin filtro": la píldora "Todas" no se resalta y el mensaje distingue "no encontramos esa categoría" de "aún no hay productos" — no inferir "todas" solo porque no hubo match.

## Referencia rápida de reglas de negocio (fuente: PDF de análisis)

- Precio mayorista automático a partir de 6 artículos en el carrito (umbral configurable, no hardcodear el número 6 dos veces).
- Envío por tramos a nivel individual: $10 (1–2 artículos), $35 (3–5).
- Pedido se reserva 3 días; no se confirma hasta verificar el pago.
- Pago con tarjeta = Stripe (automático); Zelle/Cash App/PayPal = verificación manual por admin.
- Venta final: sin devoluciones salvo daño de fábrica reportado en 24h.
- Autenticación de cliente y de administrador son flujos y rutas separadas (`/login` vs `/acceso-admin`).
