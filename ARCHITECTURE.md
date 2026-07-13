# Arquitectura de Mi Conducción

## Principios

- **Clean Architecture simplificada:** separación clara entre interfaz, aplicación, infraestructura y dominio.
- **SOLID, DRY, KISS:** componentes pequeños, responsabilidad única, sin duplicación.
- **Mobile First, responsive y accesible.**
- **Código altamente tipado:** Zod + TypeScript como fuente de verdad.

## Capas

### 1. Interfaz / Presentación (`src/app/`, `src/components/`)

Responsabilidad: renderizar UI, capturar eventos del usuario y delegar al backend.

- `app/`: rutas de Next.js, layouts, metadata.
- `components/ui/`: componentes base de shadcn (botones, inputs, etc.).
- `components/atoms/`: elementos indivisibles.
- `components/molecules/`: combinaciones de atoms.
- `components/organisms/`: secciones complejas (formularios, tablas, navbars).
- `components/templates/`: layouts de página reutilizables.

**Regla:** los componentes no contienen lógica de negocio. Llaman Server Actions o usan hooks.

### 2. Acciones (`src/server/actions/`)

Responsabilidad: punto de entrada del servidor desde la UI. Validan entrada con Zod, autentican al usuario, llaman a servicios y devuelven DTOs.

```ts
"use server";

export async function createVehicleAction(input: unknown) {
  const session = await getSession();
  const data = createVehicleSchema.parse(input);
  return vehicleService.create(session.user.id, data);
}
```

### 3. Servicios (`src/server/services/`)

Responsabilidad: orquestar la lógica de negocio, aplicar reglas y usar repositorios.

- Un servicio por dominio.
- No dependen de detalles de framework.
- Pueden lanzar errores de dominio.

### 4. Repositorios (`src/server/repositories/`)

Responsabilidad: acceder a la base de datos.

- Interfaz + implementación Prisma.
- Filtran soft delete (`deletedAt: null`).
- Devuelven entidades de Prisma o DTOs.

### 5. Dominio (`src/shared/`)

Responsabilidad: tipos, constantes, enums y funciones puras compartidas.

- `constants/`: plataformas, categorías, tipos de combustible, etc.
- `types/`: tipos puros.
- `helpers/`: funciones puras (cálculos de rendimiento, formato de moneda).

### 6. Infraestructura (`src/lib/`)

Responsabilidad: clientes singleton y configuración externa.

- `prisma.ts`: singleton de Prisma Client.
- `auth.ts`: instancia de Better Auth.
- `auth-client.ts`: cliente de Better Auth para React.
- `env.ts`: validación de variables de entorno.
- `utils.ts`: `cn()` y helpers comunes.

## Flujo típico

```
Componente
  ↓ Server Action
Validación Zod + Autenticación
  ↓ Servicio
Lógica de negocio
  ↓ Repositorio
Prisma → PostgreSQL
```

## Autenticación

Better Auth gestiona usuarios, sesiones y cuentas OAuth. Tablas: `user`, `session`, `account`, `verification`.

Las entidades de negocio relacionan con `user.id`. El perfil del conductor (`DriverProfile`) almacena preferencias (moneda, zona horaria, vehículo por defecto).

## Soft delete

Los modelos de negocio tienen `deletedAt DateTime?`. Las consultas activas filtran `deletedAt: null`. No se usa middleware global para no afectar las tablas de Better Auth.

## IDs

- Entidades de negocio: UUID generado por Prisma (`@default(uuid())`).
- Tablas de Better Auth: UUID generado por `advanced.database.generateId`.

## Dinero y distancias

Usamos `Decimal` de Prisma para precisión. En la UI se formatean como números locales.

## Extensibilidad futura

- **Múltiples vehículos:** modelo `Vehicle` ya relaciona con `userId`. Agregar `driverId` es trivial.
- **Importaciones:** `ImportJob` + patrón Adapter permitirán soportar Uber, DiDi, etc.
- **Adjuntos:** `Attachment` desacoplado del proveedor de storage.
- **OCR/IA:** se agregarán como servicios sin tocar el núcleo.
