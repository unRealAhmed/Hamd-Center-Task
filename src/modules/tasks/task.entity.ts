import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { AbstractEntity } from '../../common/abstract/abstract-entity'
import {
    TaskPriorityEnum,
    TaskPriorityType,
} from '../../common/enums/task.priority'
import { TaskStatusEnum, TaskStatusType } from '../../common/enums/task.status'
import { User } from '../users/user.entity'

@Entity('tasks')
export class Task extends AbstractEntity {
    @ApiProperty({
        description: 'Title of the task',
        example: 'Complete API integration',
    })
    @Column({ type: 'text', nullable: false })
    title: string

    @ApiProperty({
        description: 'Detailed description of the task',
        example: 'Integrate the payment gateway API',
    })
    @Column({ type: 'text', nullable: true })
    description: string

    @ApiProperty({
        enum: TaskStatusEnum,
        description: 'Current status of the task',
        example: TaskStatusEnum.IN_PROGRESS,
    })
    @Column({
        type: 'enum',
        enum: TaskStatusEnum,
        nullable: false,
    })
    status: TaskStatusType

    @ApiProperty({
        enum: TaskPriorityEnum,
        description: 'Priority level of the task',
        example: TaskPriorityEnum.HIGH,
    })
    @Column({
        type: 'enum',
        enum: TaskPriorityEnum,
        nullable: false,
    })
    priority: TaskPriorityType

    @ApiProperty({
        description: 'Due date of the task',
        example: '2025-03-10',
    })
    @Column({ type: 'timestamp', nullable: false })
    dueDate: Date

    @ApiProperty({ description: 'User assigned to the task', type: () => User })
    @ManyToOne(() => User, user => user.tasks, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'user' })
    user: User

    @RelationId((task: Task) => task.user)
    user_id: string
}
