import { Priority, Status } from "@prisma/client"
import Link from "next/link"

import { TaskActionControls } from "@/components/dashboard/TaskActionControls"
import { PriorityBadge, StatusBadge } from "@/components/dashboard/TaskBadges"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface TaskCardProps {
  id: string
  title: string
  description: string
  category?: string | null
  priority: Priority
  status: Status
  audioPlaybackUrl?: string | null
}

export function TaskCard({ id, title, description, category, priority, status, audioPlaybackUrl }: TaskCardProps) {
  return (
    <Card className="h-full justify-between">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <PriorityBadge priority={priority} />
          {category ? (
            <Badge variant="outline" className="border-border/70 text-muted-foreground">
              {category}
            </Badge>
          ) : null}
        </div>
        <StatusBadge status={status} />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
        {audioPlaybackUrl ? <audio controls src={audioPlaybackUrl} className="h-9 w-full" preload="none" /> : null}
      </CardContent>

      <CardFooter>
        <div className="flex w-full flex-col gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/dashboard/tasks/${id}`}>Ver ticket</Link>
          </Button>

          <TaskActionControls taskId={id} status={status} />
        </div>
      </CardFooter>
    </Card>
  )
}
