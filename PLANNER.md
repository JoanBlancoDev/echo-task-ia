# EchoTask AI – Planner de Mejoras y Pendientes

> Actualiza este archivo conforme avances. Prioriza P0 antes de continuar con P1/P2/P3.

---

## P0 – Críticos / Urgentes

- [x] Mejorar README con setup real, pasos de onboarding y troubleshooting.
- [x] Agregar feedback visual claro para errores de audio, IA y storage.
- [x] Revisar seguridad de claves y rotar si alguna se filtró. _(runbook en SECURITY_ROTATION.md; ejecutar rotación en proveedores)_
- [x] **Agregar sistema de créditos funcional** — validación y decremento atómico con `db.$transaction` en `createTaskFromAudioAction`.
- [x] **Limitar tamaño / duración de audio en el servidor** — `lib/audio-limits.ts` con constantes centralizadas; validación antes de subir a Storage.

---

## P1 – Importantes

- [x] Agregar Sidebar Componente custom para los items de toda la app.
- [x] **Validación a formularios de auth** — `react-hook-form` + Zod + `password-policy.ts` ya implementado en `LoginForm` y `SignUpForm`.
- [x] **Paginación en el dashboard** — `getDashboardTasks(page)` con `skip/take` y `count`, UI con controles Anterior/Siguiente y `aria-label`.
- [x] **Editar tasks** — `updateTaskAction` (Zod + ownership check) + `EditTaskForm` (modal accesible con `role="dialog"`, `aria-modal`, `react-hook-form`) en página de detalle.
- [x] **Mejorar accesibilidad** — `aria-label`/`aria-pressed` en `RecordButton`, focus trap + `Escape` en modal de eliminación (`TaskActionControls`), `aria-label` en `PriorityBadge`/`StatusBadge`, `aria-live` en temporizador de grabación, `role="dialog"` en modales.
- [x] **Middleware de autenticación** — `middleware.ts` protege `/dashboard/*` server-side con `supabase.auth.getUser()` (verificación real en servidor, no solo cookie), redirige al login si no hay sesión.
- [x] **Fix seguridad: validación server-side de status en `reprocessTaskAction`** — la UI deshabilita el botón, pero ahora el servidor también verifica `status === PENDING` para evitar bypass por invocación directa del action.
- [x] **Fix `auth/verify/page.tsx`** — era página placeholder con `console.log` de datos de auth; reemplazada con UI de éxito/error correcta.
- [ ] **Agregar tests unitarios** para Server Actions (`createTaskFromAudioAction`, `deleteTaskAction`, `updateTaskAction`) y schemas Zod.
- [ ] **Agregar tests E2E** (Playwright) para el flujo: login → grabar audio → ver ticket → editar → eliminar.

---

## P2 – Mejoras de Producto

- [ ] **Forgot password** — flujo completo: solicitar reset por email, pantalla de confirmación y manejo de token expirado/inválido.
- [ ] **Cambiar password (usuario logeado)** — sección en settings para actualizar contraseña actual por una nueva con validación de política y feedback UI.
- [ ] **Página de perfil / settings del usuario** — mostrar email, avatar, créditos restantes. El modelo `User` ya tiene `name`, `avatarUrl`, `credits`.
- [ ] **Filtros y búsqueda en el dashboard** — filtrar por `status`, `priority`, `category`; buscar por texto. Implementar con `searchParams` en el Server Component.
- [ ] **Cambiar estado del task** — selector de `Status` en `TaskActionControls` o en el detalle. Los 4 valores del enum ya existen.
- [ ] **Soporte multilenguaje (i18n)** — considerar `next-intl` si se escala a otros mercados.
- [ ] **Notificaciones push o email** — notificar al usuario al crear/procesar un task (Resend / Web Push).
- [ ] **Exportar tickets** — descargar como Markdown, JSON o copiar al portapapeles.
- [ ] **Animaciones y loaders** — reemplazar el texto "Subiendo audio..." con skeleton animado.
- [ ] **Vista Kanban** — tablero por columnas de `Status` además del grid actual.
- [ ] **Historial de versiones** — guardar versión anterior cuando se reprocesa un task con Gemini.
- [ ] **Agregar screenshots o GIFs al README.**

---

## P3 – Deuda técnica

- [ ] **Eliminar duplicación de `upsert` de usuario** — extraer a `lib/auth/get-or-create-local-user.ts`.
- [ ] **`TaskActionResult` duplicada** — unificar en `task-utils.ts`.
- [x] **Rate-limiting en Server Actions** — `@upstash/ratelimit` aplicado en `createTaskFromAudioAction`, `reprocessTaskAction`, `loginAction` y `signupAction`.
- [ ] **Variables de entorno tipadas** — módulo `lib/env.ts` con Zod que valide y exporte todas las env vars al arrancar el servidor.
- [ ] **Husky + lint-staged** — pre-commit hooks para correr `eslint` y type-check.
- [ ] **SEO: `generateMetadata`** — títulos/descripciones dinámicas en `/dashboard` y `/dashboard/tasks/[taskId]`.
- [ ] **`prisma.config.ts`** — documentar su propósito y verificar integración con la versión actual.

---

## Ideas Futuras (Backlog)

- [ ] Integración con Linear / Jira / GitHub Issues.
- [ ] App móvil (React Native + Expo) contra el mismo backend.
- [ ] Modo "batch": múltiples audios en cola.
- [ ] Analytics: tasks por semana, duración promedio, modelos Gemini usados.
- [ ] Stripe para recargar créditos (plan de pago).

---

_Última revisión: 2026-03-18_
