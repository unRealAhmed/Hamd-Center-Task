import { Injectable, NotFoundException } from '@nestjs/common'
import { Pagination } from '../../common/dtos/Pagination.dto'
import { UserService } from '../users/user.service'
import { CreateTaskDto } from './dtos/create-task.dto'
import { FilterTasksDto } from './dtos/filter-task.dto'
import { UpdateTaskDto } from './dtos/update-task.dto'
import { Task } from './task.entity'
import { TaskRepository } from './task.repository'

@Injectable()
export class TaskService {
    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly userService: UserService,
    ) { }

    async createTask(createTaskDto: CreateTaskDto, user: string): Promise<Task> {
        const userExist = await this.userService.getUserById(user)
        const task = this.taskRepository.create({
            ...createTaskDto,
            user: userExist,
        })
        return this.taskRepository.save(task)
    }

    async getTasks(
        pagination: Pagination,
        filter: FilterTasksDto,
        relations: string[] = [],
        userId: string,
        select: unknown | undefined,
    ): Promise<{ totalCount: number; pages: number; items: Task[] }> {
        const where = { ...filter.toWhereClause(), user: { id: userId } }
        const { items, totalCount } =
            await this.taskRepository.findAllWithPagination(
                where,
                relations,
                pagination.skip,
                pagination.limit,
                pagination.sortKey,
                pagination.sortDesc,
                select,
            )
        return {
            totalCount,
            pages: Math.ceil(totalCount / pagination.limit),
            items,
        }
    }

    async getTaskById(id: string, userId: string): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id, user: { id: userId } },
        })
        if (!task) throw new NotFoundException('Task not found')
        return task
    }

    async updateTask(
        id: string,
        updateTaskDto: UpdateTaskDto,
        userId: string,
    ): Promise<Task> {
        const { updatedEntity } = await this.taskRepository.updateBy(
            { id, user: { id: userId } },
            updateTaskDto,
        )
        if (!updatedEntity) {
            throw new NotFoundException('Task not found')
        }
        return updatedEntity
    }

    async deleteTask(id: string, userId: string): Promise<void> {
        const task = await this.getTaskById(id, userId)
        await this.taskRepository.remove(task)
    }
}
