import { Priority, Status } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const priorityLabels: Record<Priority, string> = {
  LOW: "P2 · Normal",
  MEDIUM: "P1 · Importante",
  HIGH: "P0 · Alta",
  URGENT: "P0 · Urgente",
}

const priorityBadgeClass: Record<Priority, string> = {
  LOW: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  HIGH: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  URGENT: "bg-red-500/15 text-red-500 border-red-500/30",
}

const statusLabels: Record<Status, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
  ARCHIVED: "Archivado",
}

const statusBadgeClass: Record<Status, string> = {
  PENDING: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
  IN_PROGRESS: "bg-sky-500/15 text-sky-500 border-sky-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  ARCHIVED: "bg-violet-500/15 text-violet-500 border-violet-500/30",
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={cn("font-semibold", priorityBadgeClass[priority])}>{priorityLabels[priority]}</Badge>
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={cn("w-fit", statusBadgeClass[status])}>
      {statusLabels[status]}
    </Badge>
  )
}
