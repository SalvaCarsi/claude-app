### Deploy en Vercel con Neon

**Context**: La app de login ya está implementada (Next.js 16 + Prisma 6 + JWT con jose + bcryptjs). Actualmente usa Docker Compose con PostgreSQL local. Migrar a Neon como BD única (local + producción) y desplegar en Vercel.

**Archivos a modificar/eliminar**:
- `docker-compose.yml` → **Eliminar**
- `.env` → Cambiar `DATABASE_URL` al connection string de Neon
- `package.json` → Ya tiene `postinstall: prisma generate` (OK para Vercel)

**Pasos**:
1. Crear proyecto en Neon Console, copiar connection string
2. Actualizar `.env`: `DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"`
3. Eliminar `docker-compose.yml` y parar contenedor (`docker-compose down`)
4. Migrar BD en Neon: `npx prisma migrate dev --name init` + `npx prisma db seed`
5. Configurar Vercel: variables `DATABASE_URL` y `JWT_SECRET` (secreto seguro para prod)
6. Deploy: `git push` (Vercel despliega automáticamente)

**Verificación**:
- Local: `npm run dev` → login contra Neon
- Vercel: URL del deploy → `/login` → login con `ppp@ppp.ppp` / `pppppp` → "hola mundo"
