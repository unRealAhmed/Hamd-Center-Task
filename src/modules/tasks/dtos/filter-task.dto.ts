import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator'
import {
    Between,
    FindManyOptions,
    ILike,
    LessThanOrEqual,
    MoreThanOrEqual,
} from 'typeorm'
import { AbstractFilter } from '../../../common/abstract/abstract-filter'
import {
    TaskPriorityEnum,
    TaskPriorityType,
} from '../../../common/enums/task.priority'
import {
    TaskStatusEnum,
    TaskStatusType,
} from '../../../common/enums/task.status'
import { Task } from '../task.entity'

export class FilterTasksDto extends AbstractFilter<Task> {
    @ApiPropertyOptional({ description: 'Filter by task title (partial match)' })
    @IsOptional()
    @IsString()
    title?: string

    @ApiPropertyOptional({
        description: 'Filter by task status',
        enum: TaskStatusEnum,
    })
    @IsOptional()
    @IsEnum(TaskStatusEnum)
    status?: TaskStatusType

    @ApiPropertyOptional({
        description: 'Filter by task priority',
        enum: TaskPriorityEnum,
    })
    @IsOptional()
    @IsEnum(TaskPriorityEnum)
    priority?: TaskPriorityType

    @ApiPropertyOptional({
        description: 'Filter tasks due on or after a specific date',
    })
    @Transform(({ value }) => (value ? new Date(value) : null))
    @IsOptional()
    @IsDate()
    due_date_start?: Date

    @ApiPropertyOptional({
        description: 'Filter tasks due on or before a specific date',
    })
    @Transform(({ value }) => (value ? new Date(value) : null))
    @IsOptional()
    @IsDate()
    due_date_end?: Date

    constructor(partial: Partial<FilterTasksDto>) {
        super(partial)
        Object.assign(this, partial)
    }

    override toWhereClause(): FindManyOptions<Task>['where'] {
        let where = super.toWhereClause() || {}
        if (this.title) {
            where = { ...where, title: ILike(`%${this.title}%`) }
        }
        if (this.status !== undefined) {
            where = { ...where, status: this.status }
        }
        if (this.priority !== undefined) {
            where = { ...where, priority: this.priority }
        }
        if (this.due_date_start && this.due_date_end) {
            where = {
                ...where,
                dueDate: Between(this.due_date_start, this.due_date_end),
            }
        } else if (this.due_date_start) {
            where = { ...where, dueDate: MoreThanOrEqual(this.due_date_start) }
        } else if (this.due_date_end) {
            where = { ...where, dueDate: LessThanOrEqual(this.due_date_end) }
        }
        console.log(where);
        return where
    }
}
