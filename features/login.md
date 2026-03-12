# Login Feature Plan

## Context

La aplicación actual es un Next.js 16 mínimo con una sola página que muestra "hola mundo desde el back". No tiene autenticación, base de datos, ni gestión de sesiones. El objetivo es añadir un sistema de login completo con PostgreSQL, protección de rutas, y un usuario de prueba.

## Decisiones Técnicas

| Componente | Tecnología | Razón |
|---|---|---|
| Hash de passwords | `bcryptjs` | Estándar de la industria. Implementación JS pura (sin compilación nativa). Hashing adaptativo con salt rounds (10 por defecto). |
| Autenticación | JWT con `jose` | Ligero para esta app pequeña. `jose` funciona en Edge runtime (necesario para middleware de Next.js). Cookie httpOnly segura. |
| Base de datos | PostgreSQL + Prisma ORM | Prisma da acceso type-safe, migraciones, y sistema de seed integrado. |
| BD local | Docker Compose | PostgreSQL 16 en contenedor, sin instalar nada en el sistema. |

## Dependencias a Instalar

```bash
npm install bcryptjs jose @prisma/client
npm install -D prisma @types/bcryptjs tsx
```

## Archivos a Crear/Modificar

### Nuevos
| Archivo | Propósito |
|---|---|
| `docker-compose.yml` | Contenedor PostgreSQL 16 |
| `.env` | `DATABASE_URL` y `JWT_SECRET` |
| `prisma/schema.prisma` | Modelo `User` (id, email unique, password, createdAt) |
| `prisma/seed.ts` | Crear usuario dummy `ppp@ppp.ppp` / `pppppp` |
| `src/lib/db.ts` | Singleton de Prisma Client |
| `src/lib/auth.ts` | Helpers JWT: `signToken()`, `verifyToken()`, `AUTH_COOKIE_NAME` |
| `src/app/login/page.tsx` | Página de login con inputs email/password |
| `src/app/api/auth/login/route.ts` | Endpoint POST: validar credenciales, setear cookie JWT |
| `src/middleware.ts` | Protección de rutas: redirigir a `/login` si no autenticado |

### Modificados
| Archivo | Cambio |
|---|---|
| `.gitignore` | Añadir `.env` (actualmente solo ignora `.env*.local`) |
| `package.json` | Añadir script `prisma.seed` y script `postinstall: prisma generate` |

### Sin cambios
- `src/app/page.tsx` — la página "hola mundo" se queda igual, el middleware la protege
- `src/app/api/hello/route.ts` — sin cambios
- `src/app/layout.tsx` — sin cambios

## Pasos de Implementación

### Paso 1: Infraestructura — Docker Compose + .env

**`docker-compose.yml`** en la raíz:
- Imagen: `postgres:16-alpine`
- Variables: `POSTGRES_USER=claude`, `POSTGRES_PASSWORD=claude123`, `POSTGRES_DB=claude_app`
- Puerto: `5432:5432`
- Volumen: `pgdata` para persistencia

**`.env`**:
```
DATABASE_URL="postgresql://claude:claude123@localhost:5432/claude_app"
JWT_SECRET="dev-secret-change-in-production"
```

Añadir `.env` a `.gitignore`.

### Paso 2: Prisma — Schema + Seed

**`prisma/schema.prisma`**:
- Modelo `User`: `id Int @id @default(autoincrement())`, `email String @unique`, `password String`, `createdAt DateTime @default(now())`

**`prisma/seed.ts`**:
- Hashear `'pppppp'` con `bcryptjs.hash('pppppp', 10)`
- Upsert usuario con email `'ppp@ppp.ppp'`

**`package.json`**: Añadir `"prisma": { "seed": "npx tsx prisma/seed.ts" }` y `"postinstall": "prisma generate"`.

### Paso 3: Lib — DB Client + Auth Helpers

**`src/lib/db.ts`**: Singleton estándar de Prisma para Next.js (evita múltiples instancias en hot reload).

**`src/lib/auth.ts`**:
- `signToken(payload)` — crea JWT firmado con HS256, expiración 24h
- `verifyToken(token)` — verifica JWT, retorna payload o null
- `AUTH_COOKIE_NAME = 'auth-token'`

### Paso 4: API — Endpoint de Login

**`src/app/api/auth/login/route.ts`** (POST):
1. Parsear body: `{ email, password }`
2. Buscar usuario: `prisma.user.findUnique({ where: { email } })`
3. Si no existe → 401 `{ error: "usuario o password invalido" }`
4. Comparar password: `bcryptjs.compare(password, user.password)`
5. Si no coincide → 401 `{ error: "usuario o password invalido" }`
6. Generar JWT con `signToken({ userId: user.id, email: user.email })`
7. Setear cookie httpOnly y retornar `{ success: true }`

> Mismo mensaje de error para usuario no encontrado y password incorrecto (prevenir enumeración de usuarios).

### Paso 5: UI — Página de Login

**`src/app/login/page.tsx`** (client component):
- Estado: `email`, `password`, `error`, `loading`
- Form con inputs email y password, botón "Iniciar Sesión"
- Submit: fetch POST a `/api/auth/login`
  - OK → `router.push('/')`
  - Error → mostrar "usuario o password invalido" en rojo
- Estilo Tailwind: card centrado, min-h-screen, consistente con la estética actual

### Paso 6: Middleware — Protección de Rutas

**`src/middleware.ts`**:
- Rutas públicas: `/login`, `/api/auth/login`
- Excluir `/_next`, `/favicon`
- Leer cookie `auth-token`, verificar JWT con `jose`
- Sin token o token inválido → redirect a `/login` (y borrar cookie si era inválida)
- Token válido → `NextResponse.next()`

> Importante: El middleware usa solo `jose` (Edge-compatible). NO importar Prisma aquí.

## Comandos de Setup

```bash
docker compose up -d                    # Iniciar PostgreSQL
npx prisma migrate dev --name init      # Crear tablas
npx prisma db seed                      # Crear usuario dummy
npm run dev                             # Iniciar la app
```

## Verificación End-to-End

1. Abrir `http://localhost:3000/` → debe redirigir a `/login`
2. Login con `wrong@email.com` / `wrong` → error "usuario o password invalido"
3. Login con `ppp@ppp.ppp` / `wrong` → mismo error
4. Login con `ppp@ppp.ppp` / `pppppp` → redirige a `/` y muestra "hola mundo desde el back"
5. Cerrar pestaña y abrir nueva a `http://localhost:3000/` → sigue autenticado (cookie persiste)
6. Ventana incógnito a `http://localhost:3000/` → redirige a `/login`
