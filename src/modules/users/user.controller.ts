import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { FilterQuery } from '../../common/decorators/FilterQuery.decorator';
import { Paginate } from '../../common/decorators/paginate';
import { SwaggerDocumentationPaginationQuery } from '../../common/decorators/swagger-paginate-decorator';
import { Pagination } from '../../common/dtos/Pagination.dto';
import { CreateUserDto } from './dtos/create.user.dto';
import { FilterUsersDto } from './dtos/filter-user.dto';
import { UpdateUserDto } from './dtos/update.user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get all users',
        description: 'Fetch a paginated list of users',
    })
    @ApiResponse({
        status: 200,
        description: 'List of users returned successfully',
        schema: {
            example: {
                totalCount: 100,
                pages: 10,
                items: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        email: 'ahmed.sayed.connect@gmail.com',
                        fullName: 'Ahmed Sayed',
                        role: 'user',
                        created_at: '2024-02-20T12:00:00Z',
                        updated_at: '2024-02-20T12:00:00Z',
                    },
                ],
            },
        },
    })
    @SwaggerDocumentationPaginationQuery()
    @ApiQuery({ type: FilterUsersDto })
    async getAllUsers(
        @Paginate() pagination: Pagination,
        @FilterQuery(FilterUsersDto) filter: FilterUsersDto,
    ): Promise<{ totalCount: number; pages: number; items: User[] }> {
        return this.userService.getAllUsers(pagination, [], filter);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Fetch a single user by their unique ID',
    })
    @ApiParam({ name: 'id', required: true, description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully',
        type: User,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserById(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
        return this.userService.getUserById(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Create a new user',
        description: 'Register a new user',
    })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        type: User,
    })
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(createUserDto);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Update user profile',
        description: 'Modify user details',
    })
    @ApiParam({ name: 'id', required: true, description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: User,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateUser(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Delete user account',
        description: 'Remove a user from the system',
    })
    @ApiParam({ name: 'id', required: true, description: 'User ID' })
    @ApiResponse({ status: 204, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async deleteUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return this.userService.deleteUser(id);
    }
}
