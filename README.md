# EchoTask AI

EchoTask AI es una app tipo micro-SaaS para convertir notas de voz en tickets técnicos estructurados con IA.

## Demo

- Live demo: `https://TU-DOMINIO.vercel.app`
- Video demo (opcional): `https://www.loom.com/share/TU_VIDEO`

---

## Capturas / GIFs (placeholders para portfolio)

> Reemplaza estas rutas con tus imágenes reales cuando las subas.

### 1) Home

![Home - EchoTask AI](./public/assets/readme/home-placeholder.png)

### 2) Login / Signup

![Auth - EchoTask AI](./public/assets/readme/auth-placeholder.png)

### 3) Dashboard (lista de tickets)

![Dashboard - EchoTask AI](./public/assets/readme/dashboard-placeholder.png)

### 4) Grabación de audio

![Recorder GIF - EchoTask AI](./public/assets/readme/recorder-placeholder.gif)

### 5) Detalle de ticket + edición

![Task detail - EchoTask AI](./public/assets/readme/task-detail-placeholder.png)

### 6) Reproceso con IA (opcional)

![Reprocess GIF - EchoTask AI](./public/assets/readme/reprocess-placeholder.gif)

---

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (Supabase)
- Supabase Auth + Storage
- Google Gemini (procesamiento de audio)
- Zod + React Hook Form
- Upstash Redis (`@upstash/ratelimit`) para rate limiting

---

## Funcionalidades principales

- Autenticación (email/password + OAuth GitHub)
- Grabación y subida de audio
- Extracción de ticket con IA (título, descripción, prioridad, categoría)
- Fallback si falla IA (el usuario no pierde su nota)
- Dashboard con paginación y detalle de task
- Edición y eliminación de task
- Reproceso de task pendiente
- Control de créditos por usuario
- Rate limiting en acciones sensibles (`auth`, `create task`, `reprocess`)

---

## Flujo funcional

1. Usuario graba audio desde el dashboard.
2. El cliente envía `FormData` a una Server Action.
3. El servidor valida límites y sesión.
4. El audio se sube a Supabase Storage.
5. Se procesa el buffer con Gemini.
6. Se guarda el task en la base de datos.
7. Se actualiza dashboard y créditos.

---

## Setup local

### Requisitos

- Bun instalado (`bun --version`)
- Proyecto Supabase (DB + Auth + Storage)
- API key de Gemini habilitada

### Instalación

```bash
bun install
cp .env.example .env
```

Completa variables en `.env`:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET` (ej: `task-audios`)
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (recomendado: `gemini-2.5-flash`)
- `NEXT_PUBLIC_APP_URL` (ej: `http://localhost:3000`)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_PREFIX` (opcional, default: `echotask`)

```bash
bunx prisma generate
bunx prisma migrate dev
bun dev
```

App local: [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

1. Conecta el repo a Vercel.
2. Define variables de entorno de **PROD** en Vercel.
3. Build recomendado:
   - Install Command: `bun install`
   - Build Command: `bunx prisma generate && bun run build`
4. Asegura que `NEXT_PUBLIC_APP_URL` apunte al dominio de producción.
5. Verifica que en Supabase Auth estén configuradas las URLs de redirect correctas (site URL + callbacks).

### Separación DEV y PROD (recomendado)

- Usa **2 proyectos Supabase**: uno para `dev`, otro para `prod`.
- Usa **2 sets de variables** en Vercel (Preview/Development vs Production).
- Nunca compartas `DATABASE_URL` ni `SUPABASE_SERVICE_ROLE_KEY` entre entornos.

---

## Seguridad y operación

- RLS habilitado en tablas principales (`User`, `Task`) con políticas por dueño.
- Rate limiting en Server Actions sensibles.
- `.env*` ignorado por git.
- Si una clave se expone: rotación inmediata (ver [SECURITY_ROTATION.md](SECURITY_ROTATION.md)).

---

## Roadmap

Pendientes y mejoras en [PLANNER.md](PLANNER.md).
