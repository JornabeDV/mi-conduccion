# Guía para agentes — Mi Conducción

## Stack y versiones

- Next.js 16 + App Router
- React 19 + TypeScript strict
- Tailwind CSS v4 + shadcn/ui (preset Nova, base color `neutral`)
- Tipografía Geist (Vercel)
- Better Auth + Prisma ORM 6 + PostgreSQL

## Arquitectura de carpetas

```
src/
  app/              # Rutas de Next.js (interfaz / presentación)
  components/       # UI: ui/ (shadcn) + atoms/ + molecules/ + organisms/ + templates/
  hooks/            # Hooks reutilizables
  lib/              # Clientes singleton y utilidades puras (prisma, auth, env, utils)
  server/
    actions/        # Server Actions (entrada a la aplicación)
    dto/            # Tipos de entrada/salida de acciones y servicios
    repositories/   # Acceso a datos (interfaces + implementaciones Prisma)
    services/       # Lógica de negocio / casos de uso
    validators/     # Esquemas Zod
    errors/         # Errores de dominio
  shared/
    constants/      # Enums y constantes de dominio
    types/          # Tipos/entidades puras
    helpers/        # Funciones puras (cálculos, formato, etc.)
```

## Reglas de código

1. **La lógica de negocio no vive en componentes visuales.** Los componentes llaman Server Actions; las acciones llaman servicios; los servicios usan repositorios.
2. **Una entidad = una interfaz de repositorio + una implementación Prisma.** Esto facilita tests y futuros cambios de persistencia.
3. **Soft delete explícito.** Todos los modelos de negocio tienen `deletedAt`. Los repositorios filtran `deletedAt: null`. No uses middlewares globales que puedan afectar a Better Auth.
4. **UUIDs.** Todas las entidades de negocio usan `@id @default(uuid())`. Better Auth ya está configurado para generar UUIDs.
5. **Dinero y kilómetros en `Decimal`.** En Prisma usamos `@db.Decimal`. En Zod/transformaciones usamos `moneySchema`.
6. **Variables de entorno validadas.** Siempre accedé a `process.env` a través de `src/lib/env.ts`.
7. **Mobile First.** Los layouts se diseñan primero para móvil y escalan a escritorio.
8. **Evitá `any`.** Tipado estricto. Los DTOs y validadores Zod son la fuente de verdad.
9. **No usamos Docker.** La base de datos local corre en PostgreSQL propio del entorno (puerto 5433 en desarrollo).
10. **PWA.** En Fase 6 se agregará `manifest.json`, service worker e iconos.
11. **shadcn/ui preset Nova.** El componente `Button` no soporta `asChild`. Para triggers personalizados (DropdownMenu, etc.) usá la prop `render` del componente base.

## Convenciones de nombres

- Archivos y carpetas: kebab-case.
- Componentes de React: PascalCase.
- Tipos/interfaces: PascalCase.
- Funciones/variables: camelCase.
- Constantes exportadas: SCREAMING_SNAKE_CASE o camelCase según contexto.

## Scripts útiles

```bash
npm run dev              # Levantar servidor de desarrollo
npm run build            # Build de producción
npm run db:migrate       # Crear migración Prisma
npm run db:deploy        # Aplicar migraciones
npm run db:seed          # Seed de desarrollo
npm run db:studio        # Explorar base de datos
```

## Notas de Better Auth

- Configuración en `src/lib/auth.ts`.
- Cliente en `src/lib/auth-client.ts`.
- Endpoints expuestos en `src/app/api/auth/[...all]/route.ts`.
- Para obtener sesión en server components/actions usá `src/server/services/session-service.ts`.
- Los formularios de auth usan `authClient.signIn.email` / `authClient.signUp.email` (cliente de Better Auth).
- Las páginas de auth y la home verifican sesión y redirigen a `/dashboard` si el usuario ya inició sesión.

## Fases del proyecto

1. **Fase 1 — Fundamentos** (completada): arquitectura, diseño, Prisma, Better Auth.
2. **Fase 2 — Auth, layout y dashboard** (completada): formularios, layout responsive, dashboard ejecutivo con KPIs y gráficos.
3. **Fase 3 — Jornadas, gastos y combustible.**
4. **Fase 4 — Estadísticas, gráficos y calendario.**
5. **Fase 5 — Exportaciones e importaciones.**
6. **Fase 6 — PWA, optimización, SEO, accesibilidad.**
7. **Fase 7 — Testing.**

No avanzar a la siguiente fase sin validar la anterior con build exitoso.
