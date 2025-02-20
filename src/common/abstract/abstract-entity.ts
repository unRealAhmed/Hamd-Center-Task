import { ApiProperty } from '@nestjs/swagger'
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export abstract class AbstractEntity {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique entity ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({
    example: '2025-02-20T10:00:00.000Z',
    description: 'Timestamp when the entity was created',
  })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date

  @ApiProperty({
    example: '2025-02-21T10:00:00.000Z',
    description: 'Timestamp when the entity was last updated',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date

  @ApiProperty({
    example: '2025-02-22T10:00:00.000Z',
    description: 'Timestamp when the entity was deleted (nullable)',
    nullable: true,
  })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date
}
