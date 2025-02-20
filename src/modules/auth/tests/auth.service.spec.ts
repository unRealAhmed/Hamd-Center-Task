import {
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { UserRole } from '../../../common/enums/roles'
import { AbstractResponse } from '../../../common/helpers/nest.reponse'
import { HashService } from '../../../common/services/hashing.service'
import { JwtService } from '../../../common/services/jwt.service'
import { CustomConfigService } from '../../../config/config.service'
import { User } from '../../users/user.entity'
import { UserRepository } from '../../users/user.repository'
import { AuthService } from '../auth.service'

describe('AuthService', () => {
    let authService: AuthService
    let userRepository: jest.Mocked<UserRepository>
    let hashService: jest.Mocked<HashService>
    let jwtService: jest.Mocked<JwtService>
    let configService: jest.Mocked<CustomConfigService>

    const mockHttpAdapter = {
        setHeader: jest.fn(),
        status: jest.fn(),
    }

    const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
            getResponse: jest.fn().mockReturnValue({
                setCookie: jest.fn(),
                clearCookie: jest.fn(),
                cookies: {},
            }),
            getRequest: jest.fn().mockReturnValue({
                cookies: {},
            }),
        }),
    }

    const mockResponse = new AbstractResponse(
        mockHttpAdapter as any,
        mockExecutionContext as any,
    ) as jest.Mocked<AbstractResponse>

    mockResponse.setHeader = jest.fn().mockReturnThis()
    mockResponse.setStatus = jest.fn().mockReturnThis()
    mockResponse.setCookie = jest.fn().mockReturnThis()
    mockResponse.getCookie = jest.fn()
    mockResponse.clearCookie = jest.fn().mockReturnThis()

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
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            getUserWithPassword: jest.fn(),
        }

        const mockHashService = {
            hash: jest.fn(),
            compare: jest.fn(),
        }

        const mockJwtService = {
            generateToken: jest.fn(),
            generateTokenPayload: jest.fn(),
            verifyToken: jest.fn(),
        }

        const mockConfigService = {
            getNodeEnv: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
                {
                    provide: HashService,
                    useValue: mockHashService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: CustomConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile()

        authService = module.get<AuthService>(AuthService)
        userRepository = module.get(UserRepository)
        hashService = module.get(HashService)
        jwtService = module.get(JwtService)
        configService = module.get(CustomConfigService)
    })

    describe('register', () => {
        const registerDto = {
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
            role: UserRole.USER,
        }

        it('should successfully register a new user', async () => {
            userRepository.findOneBy.mockResolvedValue(null)
            hashService.hash.mockResolvedValue('hashedPassword')
            userRepository.create.mockReturnValue(mockUser)
            userRepository.save.mockResolvedValue(mockUser)
            jwtService.generateToken.mockReturnValue('token')
            configService.getNodeEnv.mockReturnValue('DEV')

            const result = await authService.register(registerDto, mockResponse)

            expect(result).toEqual({ ...mockUser, password: undefined })
            expect(mockResponse.setCookie).toHaveBeenCalledTimes(2)
        })

        it('should throw ConflictException if email already exists', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser)

            await expect(
                authService.register(registerDto, mockResponse),
            ).rejects.toThrow(ConflictException)
        })
    })

    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'password123',
        }

        it('should successfully login a user', async () => {
            userRepository.getUserWithPassword.mockResolvedValue(mockUser)
            hashService.compare.mockResolvedValue(true)
            jwtService.generateToken.mockReturnValue('token')
            configService.getNodeEnv.mockReturnValue('DEV')

            const result = await authService.login(loginDto, mockResponse)

            expect(result).toMatchObject({
                accessToken: 'token',
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    fullName: mockUser.fullName,
                    role: mockUser.role,
                },
            })
            expect(mockResponse.setCookie).toHaveBeenCalledTimes(4)
        })

        it('should throw UnauthorizedException if user not found', async () => {
            userRepository.getUserWithPassword.mockResolvedValue(null)

            await expect(authService.login(loginDto, mockResponse)).rejects.toThrow(
                UnauthorizedException,
            )
        })

        it('should throw UnauthorizedException if password is invalid', async () => {
            userRepository.getUserWithPassword.mockResolvedValue(mockUser)
            hashService.compare.mockResolvedValue(false)

            await expect(authService.login(loginDto, mockResponse)).rejects.toThrow(
                UnauthorizedException,
            )
        })
    })

    describe('logout', () => {
        it('should clear cookies on logout', async () => {
            configService.getNodeEnv.mockReturnValue('DEV')

            await authService.logout('test-id', mockResponse)

            expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2)
        })
    })

    describe('getCurrentUser', () => {
        it('should return user if found', async () => {
            userRepository.findOne.mockResolvedValue(mockUser)

            const result = await authService.getCurrentUser('test-id')

            expect(result).toEqual(mockUser)
        })

        it('should throw NotFoundException if user not found', async () => {
            userRepository.findOne.mockResolvedValue(null)

            await expect(authService.getCurrentUser('test-id')).rejects.toThrow(
                NotFoundException,
            )
        })
    })

    describe('refreshToken', () => {
        it('should successfully refresh tokens', async () => {
            jwtService.verifyToken.mockReturnValue({ sub: 'test-id' })
            userRepository.findOne.mockResolvedValue(mockUser)
            jwtService.generateToken.mockReturnValue('new-token')
            configService.getNodeEnv.mockReturnValue('DEV')

            const result = await authService.refreshToken('old-token', mockResponse)

            expect(result).toMatchObject({
                accessToken: 'new-token',
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    fullName: mockUser.fullName,
                    role: mockUser.role,
                },
            })
            expect(mockResponse.setCookie).toHaveBeenCalledTimes(6)
        })

        it('should throw UnauthorizedException if token verification fails', async () => {
            jwtService.verifyToken.mockImplementation(() => {
                throw new Error()
            })

            await expect(
                authService.refreshToken('invalid-token', mockResponse),
            ).rejects.toThrow(UnauthorizedException)
        })

        it('should throw NotFoundException if user not found during refresh', async () => {
            jwtService.verifyToken.mockReturnValue({ sub: 'test-id' })
            userRepository.findOne.mockResolvedValue(null)

            await expect(
                authService.refreshToken('old-token', mockResponse),
            ).rejects.toThrow(UnauthorizedException)
        })
    })
})
