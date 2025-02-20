import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Pagination } from '../../../common/dtos/Pagination.dto';
import { UserRole } from '../../../common/enums/roles';
import { TaskPriorityEnum } from '../../../common/enums/task.priority';
import { TaskStatusEnum } from '../../../common/enums/task.status';
import { User } from '../../users/user.entity';
import { UserService } from '../../users/user.service';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { FilterTasksDto } from '../dtos/filter-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { Task } from '../task.entity';
import { TaskRepository } from '../task.repository';
import { TaskService } from '../task.service';

describe('TaskService', () => {
    let taskService: TaskService;
    let taskRepository: jest.Mocked<TaskRepository>;
    let userService: jest.Mocked<UserService>;

    const mockUser: User = {
        id: 'user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashedPassword',
        role: UserRole.USER,
        tasks: [],
        created_at: new Date(),
        updated_at: new Date(),
    };

    const mockTask: Task = {
        id: 'task-id',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatusEnum.TODO,
        priority: TaskPriorityEnum.MEDIUM,
        dueDate: new Date('2025-03-01'),
        user: mockUser,
        user_id: mockUser.id,
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(async () => {
        const mockTaskRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAllWithPagination: jest.fn(),
            updateBy: jest.fn(),
            remove: jest.fn(),
        };

        const mockUserService = {
            getUserById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskService,
                {
                    provide: TaskRepository,
                    useValue: mockTaskRepository,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        taskService = module.get<TaskService>(TaskService);
        taskRepository = module.get(TaskRepository);
        userService = module.get(UserService);
    });

    describe('createTask', () => {
        const createTaskDto: CreateTaskDto = {
            title: 'Test Task',
            description: 'Test Description',
            status: TaskStatusEnum.TODO,
            priority: TaskPriorityEnum.MEDIUM,
            dueDate: new Date('2025-03-01'),
        };

        it('should create a new task', async () => {
            userService.getUserById.mockResolvedValue(mockUser);
            taskRepository.create.mockReturnValue(mockTask);
            taskRepository.save.mockResolvedValue(mockTask);

            const result = await taskService.createTask(createTaskDto, mockUser.id);

            expect(result).toEqual(mockTask);
            expect(userService.getUserById).toHaveBeenCalledWith(mockUser.id);
            expect(taskRepository.create).toHaveBeenCalledWith({
                ...createTaskDto,
                user: mockUser,
            });
        });
    });

    describe('getTasks', () => {
        const mockPagination: Pagination = {
            skip: 0,
            page: 1,
            limit: 10,
            sortKey: 'createdAt',
            sortDesc: 'DESC',
        };

        const mockFilter = new FilterTasksDto({});

        it('should return paginated tasks', async () => {
            const mockResponse = {
                items: [mockTask],
                totalCount: 1,
            };

            taskRepository.findAllWithPagination.mockResolvedValue(mockResponse);

            const result = await taskService.getTasks(
                mockPagination,
                mockFilter,
                [],
                mockUser.id,
                undefined
            );

            expect(result).toEqual({
                totalCount: 1,
                pages: 1,
                items: [mockTask],
            });
            expect(taskRepository.findAllWithPagination).toHaveBeenCalledWith(
                { user: { id: mockUser.id } },
                [],
                0,
                10,
                'createdAt',
                'DESC',
                undefined
            );
        });
    });

    describe('getTaskById', () => {
        it('should return a task if found', async () => {
            taskRepository.findOne.mockResolvedValue(mockTask);

            const result = await taskService.getTaskById(mockTask.id, mockUser.id);

            expect(result).toEqual(mockTask);
            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockTask.id, user: { id: mockUser.id } },
            });
        });

        it('should throw NotFoundException if task not found', async () => {
            taskRepository.findOne.mockResolvedValue(null);

            await expect(
                taskService.getTaskById('non-existent-id', mockUser.id)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTask', () => {
        const updateTaskDto: UpdateTaskDto = {
            title: 'Updated Task',
            status: TaskStatusEnum.IN_PROGRESS,
        };

        it('should update and return the task', async () => {
            const updatedTask = { ...mockTask, ...updateTaskDto };
            taskRepository.updateBy.mockResolvedValue({
                updatedEntity: updatedTask,
                updateResult: { affected: 1, raw: {}, generatedMaps: [] }
            });

            const result = await taskService.updateTask(
                mockTask.id,
                updateTaskDto,
                mockUser.id
            );

            expect(result).toEqual(updatedTask);
            expect(taskRepository.updateBy).toHaveBeenCalledWith(
                { id: mockTask.id, user: { id: mockUser.id } },
                updateTaskDto
            );
        });

        it('should throw NotFoundException if task not found during update', async () => {
            taskRepository.updateBy.mockResolvedValue({
                updatedEntity: null,
                updateResult: { affected: 0, raw: {}, generatedMaps: [] }
            });

            await expect(
                taskService.updateTask('non-existent-id', updateTaskDto, mockUser.id)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteTask', () => {
        it('should successfully delete a task', async () => {
            taskRepository.findOne.mockResolvedValue(mockTask);
            taskRepository.remove.mockResolvedValue(mockTask);

            await taskService.deleteTask(mockTask.id, mockUser.id);

            expect(taskRepository.remove).toHaveBeenCalledWith(mockTask);
        });

        it('should throw NotFoundException if task not found during deletion', async () => {
            taskRepository.findOne.mockResolvedValue(null);

            await expect(
                taskService.deleteTask('non-existent-id', mockUser.id)
            ).rejects.toThrow(NotFoundException);
        });
    });
});