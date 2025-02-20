import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common'
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { GetCurrentUserId } from '../../common/decorators/CurrentUser.decorator'
import { FilterQuery } from '../../common/decorators/FilterQuery.decorator'
import { Paginate } from '../../common/decorators/paginate'
import { SwaggerDocumentationPaginationQuery } from '../../common/decorators/swagger-paginate-decorator'
import { Pagination } from '../../common/dtos/Pagination.dto'
import { CreateTaskDto } from './dtos/create-task.dto'
import { FilterTasksDto } from './dtos/filter-task.dto'
import { UpdateTaskDto } from './dtos/update-task.dto'
import { Task } from './task.entity'
import { TaskService } from './task.service'

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all tasks',
        description: 'Fetch a paginated list of tasks',
    })
    @ApiResponse({
        status: 200,
        description: 'List of tasks returned successfully',
        schema: {
            example: {
                totalCount: 100,
                pages: 10,
                items: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        title: 'Make task for Hamd Center',
                        status: 'Done',
                        priority: 'Low',
                        userId: 'user-uuid',
                        created_at: '2024-02-20T12:00:00Z',
                        updated_at: '2024-02-20T12:00:00Z',
                    },
                ],
            },
        },
    })
    @SwaggerDocumentationPaginationQuery()
    @ApiQuery({ type: FilterTasksDto })
    async getTasks(
        @Paginate() pagination: Pagination,
        @FilterQuery(FilterTasksDto) filter: FilterTasksDto,
        @GetCurrentUserId() userId: string,
    ): Promise<{ totalCount: number; pages: number; items: Task[] }> {
        return this.taskService.getTasks(pagination, filter, ['user'], userId, {})
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get task by ID',
        description: 'Fetch a single task by its unique ID',
    })
    @ApiParam({ name: 'id', required: true, description: 'Task ID' })
    @ApiResponse({
        status: 200,
        description: 'Task retrieved successfully',
        type: Task,
    })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getTaskById(
        @Param('id', new ParseUUIDPipe()) id: string,
        @GetCurrentUserId() userId: string,
    ): Promise<Task> {
        return this.taskService.getTaskById(id, userId)
    }

    @Post()
    @ApiOperation({
        summary: 'Create a new task',
        description: 'Add a new task to the system',
    })
    @ApiResponse({
        status: 201,
        description: 'Task created successfully',
        type: Task,
    })
    async createTask(
        @Body() createTaskDto: CreateTaskDto,
        @GetCurrentUserId() userId: string,
    ): Promise<Task> {
        return this.taskService.createTask(createTaskDto, userId)
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update a task',
        description: 'Modify task details',
    })
    @ApiParam({ name: 'id', required: true, description: 'Task ID' })
    @ApiResponse({
        status: 200,
        description: 'Task updated successfully',
        type: Task,
    })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async updateTask(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @GetCurrentUserId() userId: string,
    ): Promise<Task> {
        return this.taskService.updateTask(id, updateTaskDto, userId)
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a task',
        description: 'Remove a task from the system',
    })
    @ApiParam({ name: 'id', required: true, description: 'Task ID' })
    @ApiResponse({ status: 204, description: 'Task deleted successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async deleteTask(
        @Param('id', new ParseUUIDPipe()) id: string,
        @GetCurrentUserId() userId: string,
    ): Promise<void> {
        return this.taskService.deleteTask(id, userId)
    }
}
