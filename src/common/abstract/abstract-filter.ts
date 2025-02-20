import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'
import {
  Between,
  FindManyOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm'

export abstract class AbstractFilter<T> {
  @ApiPropertyOptional({
    description: 'Filter by creation date (start)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  created_at_start?: string

  @ApiPropertyOptional({
    description: 'Filter by creation date (end)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  created_at_end?: string

  @ApiPropertyOptional({
    description: 'Filter by update date (start)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  updated_at_start?: string

  @ApiPropertyOptional({
    description: 'Filter by update date (end)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  updated_at_end?: string

  constructor(partial: Partial<AbstractFilter<T>>) {
    Object.assign(this, partial)
  }

  toWhereClause(): FindManyOptions<T>['where'] {
    const where: FindManyOptions<any>['where'] = {}

    if (this.created_at_start && this.created_at_end) {
      where.created_at = Between(
        new Date(this.created_at_start),
        new Date(this.created_at_end),
      )
    } else if (this.created_at_start) {
      where.created_at = MoreThanOrEqual(new Date(this.created_at_start))
    } else if (this.created_at_end) {
      where.created_at = LessThanOrEqual(new Date(this.created_at_end))
    }

    if (this.updated_at_start && this.updated_at_end) {
      where.updated_at = Between(
        new Date(this.updated_at_start),
        new Date(this.updated_at_end),
      )
    } else if (this.updated_at_start) {
      where.updated_at = MoreThanOrEqual(new Date(this.updated_at_start))
    } else if (this.updated_at_end) {
      where.updated_at = LessThanOrEqual(new Date(this.updated_at_end))
    }

    return where
  }
}
