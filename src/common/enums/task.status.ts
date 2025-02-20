export enum TaskStatusEnum {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export type TaskStatusType = (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum]
export const TaskStatusValues = Object.values(TaskStatusEnum)
