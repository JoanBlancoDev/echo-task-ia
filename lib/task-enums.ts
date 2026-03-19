export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]
