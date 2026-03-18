import { notFound, redirect } from "next/navigation"

import { TaskActionControls } from "@/components/dashboard/TaskActionControls"
import { EditTaskForm } from "@/components/dashboard/EditTaskForm"
import { PriorityBadge, StatusBadge } from "@/components/dashboard/TaskBadges"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSignedStorageUrl } from "@/lib/supabase/storage"

interface TaskDetailPageProps {
  params: Promise<{
    taskId: string
  }>
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const localUser = await db.user.findUnique({
    where: { externalId: user.id },
    select: { id: true },
  })

  if (!localUser) {
    notFound()
  }

  const task = await db.task.findFirst({
    where: {
      id: taskId,
      userId: localUser.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      priority: true,
      status: true,
      transcription: true,
      duration: true,
      createdAt: true,
      audioUrl: true,
    },
  })

  if (!task) {
    notFound()
  }

  const audioPlaybackUrl = task.audioUrl ? await createSignedStorageUrl(task.audioUrl) : null

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10 md:px-8">
      <DashboardTopBar title="Detalle del ticket" backHref="/dashboard" backLabel="Volver" />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {task.category ? <Badge variant="outline">{task.category}</Badge> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{task.description}</p>
          <div className="text-xs text-muted-foreground">
            <p>Creado: {task.createdAt.toLocaleString("es-ES")}</p>
            <p>Duración: {task.duration ?? 0}s</p>
          </div>
          {audioPlaybackUrl ? <audio controls src={audioPlaybackUrl} className="w-full" preload="none" /> : null}
        </CardContent>
      </Card>

      {task.transcription ? (
        <Card>
          <CardHeader>
            <CardTitle>Transcripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{task.transcription}</p>
          </CardContent>
        </Card>
      ) : null}

      <EditTaskForm
        taskId={task.id}
        initialValues={{
          title: task.title,
          description: task.description ?? "",
          priority: task.priority,
          category: (task.category as "Bug" | "Feature" | "Refactor" | "Task") ?? "Task",
        }}
      />

      <TaskActionControls taskId={task.id} status={task.status} layout="inline" redirectOnDeleteTo="/dashboard" />
    </main>
  )
}
