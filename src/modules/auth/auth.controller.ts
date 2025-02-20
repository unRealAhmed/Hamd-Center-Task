import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import {
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { FastifyRequest } from 'fastify'
import {
    GetCurrentUser,
    GetCurrentUserId,
} from '../../common/decorators/CurrentUser.decorator'
import { Public } from '../../common/decorators/Public.decorator'
import { RefreshTokenGuard } from '../../common/guards/token.guard'
import { GenericResponse, WrapperType } from '../../common/helpers/nest.reponse'
import { User } from '../users/user.entity'
import { AuthService } from './auth.service'
import { LoginDto } from './dtos/login.dto'
import { RegisterUserDto } from './dtos/register.user.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiCreatedResponse({
        description: 'User registered successfully',
        type: User,
    })
    @ApiConflictResponse({ description: 'Email already in use' })
    async register(
        @Body() registerDto: RegisterUserDto,
        @GenericResponse() res: WrapperType<GenericResponse>,
    ) {
        return this.authService.register(registerDto, res)
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiOkResponse({ description: 'User logged in successfully', type: User })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    async login(
        @Body() loginDto: LoginDto,
        @GenericResponse() res: WrapperType<GenericResponse>,
    ) {
        return this.authService.login(loginDto, res)
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout user' })
    @ApiOkResponse({
        description: 'User logged out successfully',
        schema: { example: { message: 'Logged out successfully' } },
    })
    async logout(
        @GetCurrentUser() user: User,
        @GenericResponse() res: WrapperType<GenericResponse>,
    ) {
        await this.authService.logout(user.id, res)
        return { message: 'Logged out successfully' }
    }

    @Public()
    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiOkResponse({
        description: 'New access token generated',
        schema: { example: { accessToken: 'new-access-token' } },
    })
    @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
    async refresh(
        @Req() req: FastifyRequest,
        @GenericResponse() res: WrapperType<GenericResponse>,
    ) {
        const refreshToken = req.cookies['refreshToken']
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is missing')
        }
        return this.authService.refreshToken(refreshToken, res)
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiOkResponse({ description: 'Returns current user', type: User })
    @ApiUnauthorizedResponse({ description: 'Invalid access token' })
    async getCurrentUser(@GetCurrentUserId() user: string) {
        return this.authService.getCurrentUser(user)
    }
}
