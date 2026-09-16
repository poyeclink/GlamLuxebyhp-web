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

## Referencia rápida de reglas de negocio (fuente: PDF de análisis)

- Precio mayorista automático a partir de 6 artículos en el carrito (umbral configurable, no hardcodear el número 6 dos veces).
- Envío por tramos a nivel individual: $10 (1–2 artículos), $35 (3–5).
- Pedido se reserva 3 días; no se confirma hasta verificar el pago.
- Pago con tarjeta = Stripe (automático); Zelle/Cash App/PayPal = verificación manual por admin.
- Venta final: sin devoluciones salvo daño de fábrica reportado en 24h.
- Autenticación de cliente y de administrador son flujos y rutas separadas (`/login` vs `/acceso-admin`).
