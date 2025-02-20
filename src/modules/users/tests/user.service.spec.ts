import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { DeleteResult, ILike, UpdateResult } from 'typeorm'
import { Pagination } from '../../../common/dtos/Pagination.dto'
import { UserRole } from '../../../common/enums/roles'
import { CreateUserDto } from '../dtos/create.user.dto'
import { FilterUsersDto } from '../dtos/filter-user.dto'
import { UpdateUserDto } from '../dtos/update.user.dto'
import { User } from '../user.entity'
import { UserRepository } from '../user.repository'
import { UserService } from '../user.service'

describe('UserService', () => {
    let userService: UserService
    let userRepository: jest.Mocked<UserRepository>

    const mockUser: User = {
        id: 'test-id',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashedPassword',
        role: UserRole.USER,
        tasks: [],
        created_at: new Date(),
        updated_at: new Date(),
    }

    beforeEach(async () => {
        const mockUserRepository = {
            findAllWithPagination: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            updateBy: jest.fn(),
            delete: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
            ],
        }).compile()

        userService = module.get<UserService>(UserService)
        userRepository = module.get(UserRepository)
    })

    describe('getAllUsers', () => {
        const mockPagination: Pagination = {
            skip: 0,
            limit: 10,
            page: 1,
            sortKey: 'createdAt',
            sortDesc: 'DESC',
        }

        const mockFilterPartial = {
            email: 'test@example.com',
        }

        const mockFilter = new FilterUsersDto(mockFilterPartial)

        it('should return paginated users with total count and pages', async () => {
            const mockResponse = {
                items: [mockUser],
                totalCount: 1,
            }

            userRepository.findAllWithPagination.mockResolvedValue(mockResponse)

            const result = await userService.getAllUsers(
                mockPagination,
                [],
                mockFilter,
                [],
            )

            expect(result).toEqual({
                totalCount: 1,
                pages: 1,
                items: [mockUser],
            })
            expect(userRepository.findAllWithPagination).toHaveBeenCalledWith(
                { email: ILike('%test@example.com%') },
                [],
                0,
                10,
                'createdAt',
                'DESC',
            )
        })
    })

    describe('getUserById', () => {
        it('should return a user if found', async () => {
            userRepository.findOne.mockResolvedValue(mockUser)

            const result = await userService.getUserById('test-id')

            expect(result).toEqual(mockUser)
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'test-id' },
            })
        })

        it('should throw NotFoundException if user not found', async () => {
            userRepository.findOne.mockResolvedValue(null)

            await expect(userService.getUserById('non-existent-id')).rejects.toThrow(
                NotFoundException,
            )
        })
    })

    describe('createUser', () => {
        const createUserDto: CreateUserDto = {
            email: 'test@example.com',
            fullName: 'Test User',
            password: 'password123',
            role: UserRole.USER,
        }

        it('should create and return a new user', async () => {
            userRepository.create.mockReturnValue(mockUser)
            userRepository.save.mockResolvedValue(mockUser)

            const result = await userService.createUser(createUserDto)

            expect(result).toEqual(mockUser)
            expect(userRepository.create).toHaveBeenCalledWith(createUserDto)
            expect(userRepository.save).toHaveBeenCalledWith(mockUser)
        })
    })

    describe('updateUser', () => {
        const updateUserDto: UpdateUserDto = {
            fullName: 'Updated Name',
        }

        it('should update and return the user if found', async () => {
            const updatedUser = { ...mockUser, fullName: 'Updated Name' }
            const mockUpdateResult: UpdateResult = {
                affected: 1,
                raw: {},
                generatedMaps: [],
            }

            userRepository.updateBy.mockResolvedValue({
                updatedEntity: updatedUser,
                updateResult: mockUpdateResult,
            })

            const result = await userService.updateUser('test-id', updateUserDto)

            expect(result).toEqual(updatedUser)
            expect(userRepository.updateBy).toHaveBeenCalledWith(
                { id: 'test-id' },
                updateUserDto,
            )
        })

        it('should throw NotFoundException if user not found during update', async () => {
            const mockUpdateResult: UpdateResult = {
                affected: 0,
                raw: {},
                generatedMaps: [],
            }

            userRepository.updateBy.mockResolvedValue({
                updatedEntity: null,
                updateResult: mockUpdateResult,
            })

            await expect(
                userService.updateUser('non-existent-id', updateUserDto),
            ).rejects.toThrow(NotFoundException)
        })
    })

    describe('deleteUser', () => {
        it('should successfully delete a user', async () => {
            const mockDeleteResult: DeleteResult = {
                affected: 1,
                raw: {},
            }

            userRepository.delete.mockResolvedValue(mockDeleteResult)

            await userService.deleteUser('test-id')

            expect(userRepository.delete).toHaveBeenCalledWith({ id: 'test-id' })
        })

        it('should throw NotFoundException if user not found during deletion', async () => {
            const mockDeleteResult: DeleteResult = {
                affected: 0,
                raw: {},
            }

            userRepository.delete.mockResolvedValue(mockDeleteResult)

            await expect(userService.deleteUser('non-existent-id')).rejects.toThrow(
                NotFoundException,
            )
        })
    })
})
