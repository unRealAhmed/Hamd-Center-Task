import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, OneToMany } from 'typeorm'
import { AbstractEntity } from '../../common/abstract/abstract-entity'
import { UserRole, UserRoleType } from '../../common/enums/roles'
import { Task } from '../tasks/task.entity'

@Entity('users')
export class User extends AbstractEntity {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @Column({ unique: true, nullable: false })
    email: string

    @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
    @Column({ nullable: false })
    fullName: string

    @Column({ nullable: false, select: false })
    password: string

    @ApiProperty({
        example: 'user',
        enum: UserRole,
        description: 'User role in the system',
    })
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
        nullable: false,
    })
    role: UserRoleType

    @OneToMany(() => Task, task => task.user)
    tasks: Task[]
}
