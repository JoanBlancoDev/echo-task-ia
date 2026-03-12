# EchoTask AI

Micro-SaaS para capturar notas de voz y convertirlas en tickets técnicos estructurados con IA.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (Supabase)
- Supabase Auth + Storage
- Gemini (Google Generative AI)
- Zod para validación de salida IA

## Flujo principal

1. Usuario graba audio desde dashboard.
2. Cliente envía `FormData` con audio a Server Action.
3. Servidor sube audio a Supabase Storage.
4. Servidor procesa el buffer con Gemini.
5. Respuesta de IA se valida con Zod.
6. Se crea `Task` en Prisma.
7. Dashboard refresca y muestra ticket.

## Requisitos

- Bun instalado (`bun --version`)
- Proyecto Supabase (DB + Auth + Storage)
- API key de Gemini habilitada

## Setup local

1. Instalar dependencias:

```bash
bun install
```

2. Crear variables de entorno desde plantilla:

```bash
cp .env.example .env
```

3. Completar `.env`:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET` (ej: `task-audios`)
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (recomendado: `gemini-2.5-flash`)
- `NEXT_PUBLIC_APP_URL` (ej: `http://localhost:3000`)

4. Prisma:

```bash
bunx prisma generate
bunx prisma migrate dev
```

5. Ejecutar proyecto:

```bash
bun dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Supabase mínimo requerido

- Auth habilitado.
- Bucket de storage creado (por defecto `task-audios`).
- Políticas de acceso coherentes con upload/download desde servidor.

## UX y feedback actual

- Error de micrófono (permiso/navegador) en el componente de grabación.
- Error de Storage/Session/Audio inválido con mensaje persistente y toast.
- Advertencia de IA (Gemini) con fallback automático de task.
- Éxito confirmado en UI y refresh del dashboard.

## Troubleshooting

### No sube el audio

- Verifica `SUPABASE_STORAGE_BUCKET`.
- Revisa `SUPABASE_SERVICE_ROLE_KEY`.
- Confirma existencia del bucket en Supabase.

### Gemini falla o sin cuota

- Verifica `GEMINI_API_KEY`.
- Confirma billing/cuota en Google AI Studio.
- Ajusta `GEMINI_MODEL` a un modelo disponible.

### Error de sesión

- Cierra sesión y vuelve a autenticar.
- Verifica variables de Supabase cliente (`NEXT_PUBLIC_*`).

## Seguridad (importante)

- `.env*` está ignorado por git.
- Nunca commitear claves reales.
- Si una clave se expuso, rotarla inmediatamente (Supabase + Gemini).
- Ver [SECURITY_ROTATION.md](SECURITY_ROTATION.md).

## Próximos pasos

Ver [PLANNER.md](PLANNER.md).
