import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator'
import { TaskPriorityEnum, TaskPriorityType } from '../../../common/enums/task.priority'
import { TaskStatusEnum, TaskStatusType } from '../../../common/enums/task.status'
import { Transform } from 'class-transformer'

export class UpdateTaskDto {
    @ApiProperty({
        example: 'Finish project report',
        description: 'Title of the task',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string

    @ApiProperty({
        example: 'Prepare a detailed report for the project',
        description: 'Description of the task',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({
        example: TaskStatusEnum.IN_PROGRESS,
        description: 'Status of the task',
        enum: TaskStatusEnum,
        required: false,
    })
    @IsEnum(TaskStatusEnum)
    @IsOptional()
    status?: TaskStatusType

    @ApiProperty({
        example: TaskPriorityEnum.HIGH,
        description: 'Priority of the task',
        enum: TaskPriorityEnum,
        required: false,
    })
    @IsEnum(TaskPriorityEnum)
    @IsOptional()
    priority?: TaskPriorityType

    @ApiProperty({
        example: '2025-03-01',
        description: 'Due date of the task (YYYY-MM-DD or ISO format)',
        required: false,
    })
    @Transform(({ value }) => value ? new Date(value) : null)
    @IsDate()
    @IsOptional()
    dueDate?: Date;
}
