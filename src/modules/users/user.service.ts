import { Injectable, NotFoundException } from '@nestjs/common'
import { Pagination } from '../../common/dtos/Pagination.dto'
import { CreateUserDto } from './dtos/create.user.dto'
import { UpdateUserDto } from './dtos/update.user.dto'
import { User } from './user.entity'
import { UserRepository } from './user.repository'
import { FindManyOptions } from 'typeorm'
import { FilterUsersDto } from './dtos/filter-user.dto'

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async getAllUsers(
        pagination: Pagination,
        relations: string[] = [],
        conditions: FilterUsersDto,
        selection: string[] = [],
    ): Promise<{ totalCount: number; pages: number; items: User[] }> {
        const where = conditions.toWhereClause()
        const { items, totalCount } =
            await this.userRepository.findAllWithPagination(
                where,
                relations,
                pagination.skip,
                pagination.limit,
                pagination.sortKey,
                pagination.sortDesc,
            )
        return {
            totalCount,
            pages: Math.ceil(totalCount / pagination.limit),
            items,
        }
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } })
        if (!user) {
            throw new NotFoundException('User not found')
        }
        return user
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto)
        return await this.userRepository.save(user)
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const { updatedEntity } = await this.userRepository.updateBy(
            { id },
            updateUserDto,
        )
        if (!updatedEntity) {
            throw new NotFoundException('User not found')
        }
        return updatedEntity
    }

    async deleteUser(id: string): Promise<void> {
        const result = await this.userRepository.delete({ id })
        if (!result.affected) {
            throw new NotFoundException('User not found')
        }
    }
}
