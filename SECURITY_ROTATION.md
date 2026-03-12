# Security Rotation Runbook

## Objetivo

Checklist rápido para rotar secretos si hubo exposición de credenciales durante desarrollo.

## 1) Supabase

### A. Rotar `SUPABASE_SERVICE_ROLE_KEY`

1. Ir a Supabase Dashboard → Project Settings → API.
2. Regenerar `service_role` key.
3. Actualizar `.env` local y secretos en deploy.
4. Reiniciar app.

### B. Rotar `NEXT_PUBLIC_SUPABASE_ANON_KEY`

1. Regenerar `anon` key en el mismo panel.
2. Actualizar `.env` y variables del entorno de despliegue.
3. Verificar login/logout en la app.

### C. Rotar contraseña de DB (si fue expuesta)

1. Ir a Database Settings.
2. Cambiar password de Postgres.
3. Actualizar `DATABASE_URL` y `DIRECT_URL`.
4. Probar `bunx prisma migrate dev` y lecturas/escrituras.

## 2) Gemini

### Rotar `GEMINI_API_KEY`

1. Ir a Google AI Studio / Google Cloud Console.
2. Revocar la key actual y crear una nueva.
3. Actualizar `.env` y secretos de deploy.
4. Probar endpoint de generación (audio/texto).

## 3) Git y repositorio

- Confirmar que `.env*` no esté versionado (`git ls-files .env .env.local`).
- Si hubo commit accidental de secretos, limpiar historial y forzar rotación.
- Revisar PRs/issues para evitar pegado de tokens.

## 4) Validación posterior

- Login en app.
- Upload de audio a Supabase Storage.
- Procesamiento con Gemini.
- Creación de task en dashboard.

## Estado

- [ ] Ejecutado en local
- [ ] Ejecutado en staging
- [ ] Ejecutado en producción
