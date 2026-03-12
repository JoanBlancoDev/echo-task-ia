# Contexto del Proyecto: EchoTask AI

## Objetivo

Un Micro-SaaS que captura notas de voz y las convierte en tickets técnicos estructurados (JSON) para desarrolladores, utilizando IA multimodal.

## Stack Tecnológico

- **Runtime:** Bun (priorizar comandos `bun` y `bunx`).
- **Framework:** Next.js 16 (App Router) + React 19.
- **UI:** Tailwind CSS + shadcn/ui.
- **ORM:** Prisma (PostgreSQL en Supabase).
- **Auth & Storage:** Supabase Auth y Supabase Storage.
- **IA:** Google Generative AI (Gemini 1.5 Flash) para procesamiento de audio a texto estructurado.

## Arquitectura y Reglas

1. **Server-First:** Usar Server Components y Server Actions para mutaciones. Evitar `use client` a menos que sea necesario para interactividad (grabación de audio).
2. **Tipado:** TypeScript estricto. Todas las respuestas de la IA deben validarse con Zod antes de guardarse en la DB.
3. **Estilos:** Usar componentes de shadcn/ui. Mantener un diseño limpio y profesional (Dark mode por defecto).
4. **Manejo de Archivos:** Los audios se graban en formato `.webm` o `.mp3`, se suben a Supabase Storage y la URL se guarda en la tabla `Task` de Prisma.

## Definición de "Task" (Ticket)

Cada nota de voz debe resultar en:

- Título conciso.
- Descripción detallada en Markdown.
- Prioridad: P0 (Urgente), P1 (Importante), P2 (Normal).
- Etiquetas: Bug, Feature, Refactor, Task.

Entiende este contexto para asistirme en la creación de componentes, esquemas de base de datos y lógica de servidor.

## Flujo de Datos Principal

1. Cliente: Graba audio -> Sube a Supabase Storage.
2. Cliente: Llama a Server Action con la `audio_url`.
3. Servidor: Server Action descarga buffer de audio de Supabase.
4. Servidor: Envía buffer a Gemini 2.5 Flash con System Prompt.
5. Servidor: Valida JSON con Zod y guarda en DB vía Prisma.
6. Cliente: Revalida ruta y muestra el ticket generado.
