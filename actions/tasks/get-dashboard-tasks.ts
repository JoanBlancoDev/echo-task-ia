"use server"

import { Priority, Status } from "@prisma/client"

import { db } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSignedStorageUrl } from "@/lib/supabase/storage"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"

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

export interface DashboardData {
  tasks: DashboardTask[]
  credits: number
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}



export async function getDashboardTasks(page = 1): Promise<DashboardData> {
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
    select: { id: true, credits: true },
  })

  const safePage = Math.max(1, page)
  const skip = (safePage - 1) * DASHBOARD_PAGE_SIZE

  const [totalCount, tasks] = await db.$transaction([
    db.task.count({ where: { userId: localUser.id } }),
    db.task.findMany({
      where: { userId: localUser.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: DASHBOARD_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        audioUrl: true,
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / DASHBOARD_PAGE_SIZE))

  const tasksWithPlayback = await Promise.all(
    tasks.map(async (task) => ({
      ...task,
      audioPlaybackUrl: task.audioUrl ? await createSignedStorageUrl(task.audioUrl) : null,
    }))
  )

  return {
    tasks: tasksWithPlayback,
    credits: localUser.credits,
    totalCount,
    page: safePage,
    pageSize: DASHBOARD_PAGE_SIZE,
    totalPages,
  }
}
