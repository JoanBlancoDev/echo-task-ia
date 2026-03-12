"use server"

import { Priority, Status } from "@prisma/client"

import { db } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSignedStorageUrl } from "@/lib/supabase/storage"

export interface DashboardTask {
  id: string
  title: string
  description: string | null
  category: string | null
  priority: Priority
  status: Status
  audioUrl: string | null
  audioPlaybackUrl: string | null
}

// Puedes agregar parámetros para filtros/paginación en el futuro
export async function getDashboardTasks(/* params: { filter?: string, page?: number } */): Promise<DashboardTask[]> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No user found in session")
  }

  const localUser = await db.user.upsert({
    where: { externalId: user.id },
    update: {
      email: user.email ?? `user-${user.id}@placeholder.local`,
      name: user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    create: {
      externalId: user.id,
      email: user.email ?? `user-${user.id}@placeholder.local`,
      name: user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    select: { id: true },
  })

  const tasks = await db.task.findMany({
    where: { userId: localUser.id },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      priority: true,
      status: true,
      audioUrl: true,
    },
  })

  const tasksWithPlayback = await Promise.all(
    tasks.map(async (task) => ({
      ...task,
      audioPlaybackUrl: task.audioUrl ? await createSignedStorageUrl(task.audioUrl) : null,
    }))
  )

  return tasksWithPlayback
}
