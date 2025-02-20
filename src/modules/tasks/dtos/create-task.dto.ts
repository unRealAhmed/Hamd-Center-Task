import { ApiProperty } from '@nestjs/swagger'
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator'
import { TaskPriorityEnum, TaskPriorityType } from '../../../common/enums/task.priority'
import { TaskStatusEnum, TaskStatusType } from '../../../common/enums/task.status'
import { Transform } from 'class-transformer'

export class CreateTaskDto {
    @ApiProperty({
        example: 'Finish project report',
        description: 'Title of the task',
    })
    @IsString()
    @IsNotEmpty()
    title: string

    @ApiProperty({
        example: 'Prepare a detailed report for the project',
        description: 'Description of the task',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({
        example: TaskStatusEnum.TODO,
        description: 'Status of the task',
        enum: TaskStatusEnum,
        required: true
    })
    @IsEnum(TaskStatusEnum)
    status: TaskStatusEnum

    @ApiProperty({
        example: TaskPriorityEnum.MEDIUM,
        description: 'Priority of the task',
        enum: TaskPriorityEnum,
        required: true
    })
    @IsEnum(TaskPriorityEnum)
    priority: TaskPriorityEnum

    @ApiProperty({
        example: '2025-03-01',
        description: 'Due date of the task (YYYY-MM-DD or ISO format)',
    })
    @Transform(({ value }) => new Date(value))
    @IsDate()
    @IsNotEmpty()
    dueDate: Date;
}
