# Botón de Logout en página principal

## Contexto
La app tiene autenticación JWT custom con cookie HTTP-only (`auth-token`), pero no existe funcionalidad de logout. Se necesita un botón en `page.tsx` para desloguearse.

## Cambios

### 1. Crear `src/app/api/auth/logout/route.ts`
- Endpoint POST que borra la cookie `auth-token` usando `AUTH_COOKIE_NAME` de `@/lib/auth`
- Borra la cookie seteándola con `maxAge: 0`
- Retorna JSON `{ success: true }`
- Patrón idéntico al login route para consistencia

### 2. Modificar `src/middleware.ts`
- Agregar `"/api/auth/logout"` al array `PUBLIC_PATHS` (línea 4)

### 3. Modificar `src/app/page.tsx`
- Agregar función `handleLogout` que hace `fetch("/api/auth/logout", { method: "POST" })` y redirige a `/login` con `window.location.href`
- Agregar botón de logout posicionado en la esquina superior derecha

## Archivos a modificar
- `src/app/api/auth/logout/route.ts` (nuevo)
- `src/middleware.ts` (línea 4)
- `src/app/page.tsx`

## Verificación
- Iniciar la app con `npm run dev`
- Navegar a `/` (debe estar logueado)
- Hacer clic en el botón de logout
- Verificar redirección a `/login`
- Intentar navegar a `/` — debe redirigir a `/login` (cookie borrada)
