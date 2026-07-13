# Mi Conducción

ERP personal para conductores de plataformas de transporte (Uber, Cabify, DiDi, Maxim, InDrive).

## Estado

**Fase 1 completada:** arquitectura de producción, sistema de diseño, modelo Prisma, autenticación con Better Auth y base de datos configurada.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- Better Auth
- Prisma ORM 6 + PostgreSQL
- Vercel (deployment objetivo)

## Requisitos

- Node.js 22+
- npm 10+
- PostgreSQL 14+ (local o cloud)

## Instalación

```bash
npm install
```

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

Variables requeridas:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `BETTER_AUTH_SECRET` | Clave secreta de 32+ caracteres para Better Auth |
| `BETTER_AUTH_URL` | URL base de la app (`http://localhost:3000` en dev) |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app |

Generar secreto:

```bash
openssl rand -base64 32
```

## Base de datos

Asegurate de tener PostgreSQL corriendo y la base de datos creada. Luego:

```bash
npm run db:migrate
npm run db:seed
```

El seed crea un usuario de prueba:

- Email: `driver@example.com`
- Contraseña: `password123`

## Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts útiles

```bash
npm run build            # Build de producción
npm run lint             # ESLint
npm run db:generate      # Generar Prisma Client
npm run db:migrate       # Crear migración
npm run db:deploy        # Aplicar migraciones
npm run db:seed          # Seed de desarrollo
npm run db:studio        # Prisma Studio
```

## Estructura

Ver `AGENTS.md` para convenciones de arquitectura, nombres y patrones.

## Licencia

Privado.
