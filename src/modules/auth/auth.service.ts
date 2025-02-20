import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { AbstractResponse } from '../../common/helpers/nest.reponse'
import { HashService } from '../../common/services/hashing.service'
import { JwtService } from '../../common/services/jwt.service'
import { LoginResponse } from '../../common/types/login.reponse'
import { CustomConfigService } from '../../config/config.service'
import { User } from '../users/user.entity'
import { UserRepository } from '../users/user.repository'
import { LoginDto } from './dtos/login.dto'
import { RegisterUserDto } from './dtos/register.user.dto'

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly hashingService: HashService,
        private readonly configService: CustomConfigService,
    ) { }

    async register(registerDto: RegisterUserDto, res: AbstractResponse) {
        const existingUser = await this.userRepository.findOneBy({
            email: registerDto.email,
        })
        if (existingUser) {
            throw new ConflictException('Email already in use')
        }

        const hashedPassword = await this.hashingService.hash(registerDto.password)

        const user = this.userRepository.create({
            ...registerDto,
            password: hashedPassword,
        })

        const savedUser = await this.userRepository.save(user)
        const accessToken = this.generateUserToken(savedUser)
        const refreshToken = this.generateUserRefreshToken(savedUser)

        this.setTokenCookies(res, accessToken, refreshToken)
        return { ...savedUser, password: undefined }
    }

    async login(
        loginDto: LoginDto,
        res: AbstractResponse,
    ): Promise<LoginResponse> {
        const user = await this.userRepository.getUserWithPassword(loginDto.email)
        if (!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const isPasswordValid = await this.hashingService.compare(
            loginDto.password,
            user.password,
        )
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const accessToken = this.generateUserToken(user)
        const refreshToken = this.generateUserRefreshToken(user)

        this.setTokenCookies(res, accessToken, refreshToken)

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        }
    }

    async logout(userId: string, res: AbstractResponse): Promise<void> {
        this.clearTokenCookies(res)
    }

    async getCurrentUser(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')

        return user
    }

    async refreshToken(
        oldRefreshToken: string,
        res: AbstractResponse,
    ): Promise<LoginResponse> {
        try {
            const payload = this.jwtService.verifyToken(oldRefreshToken, 'refresh')
            if (!payload) throw new UnauthorizedException('Invalid token')
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
            })

            if (!user) {
                throw new NotFoundException('User not found')
            }

            const accessToken = this.generateUserToken(user)
            const refreshToken = this.generateUserRefreshToken(user)

            this.setTokenCookies(res, accessToken, refreshToken)

            return {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
            }
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token')
        }
    }

    private setTokenCookies(
        res: AbstractResponse,
        accessToken: string,
        refreshToken: string,
    ): void {
        res.setCookie('accessToken', accessToken, {
            httpOnly: true,
            secure: this.configService.getNodeEnv() === 'PROD',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        })

        res.setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.configService.getNodeEnv() === 'PROD',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
    }

    private clearTokenCookies(res: AbstractResponse): void {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: this.configService.getNodeEnv() === 'PROD',
            sameSite: 'strict',
        })

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: this.configService.getNodeEnv() === 'PROD',
            sameSite: 'strict',
        })
    }

    generateUserToken(user: User): string {
        return this.jwtService.generateToken(
            this.jwtService.generateTokenPayload(user, 'access'),
            'access',
        )
    }

    generateUserRefreshToken(user: User): string {
        return this.jwtService.generateToken(
            this.jwtService.generateTokenPayload(user, 'refresh'),
            'refresh',
        )
    }
}
