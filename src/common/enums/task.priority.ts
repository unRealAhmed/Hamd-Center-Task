export enum TaskPriorityEnum {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export type TaskPriorityType = (typeof TaskPriorityEnum)[keyof typeof TaskPriorityEnum];
export const TaskPriorityValues = Object.values(TaskPriorityEnum);