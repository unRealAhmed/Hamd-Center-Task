import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/Public.decorator'
import { JwtService } from '../services/jwt.service'
import { TokenPayload } from '../types/token.type'

@Injectable()
export class AccessTokenGuard {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
        if (isPublic) return true
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Access token is missing')
        }

        const token = authHeader.split(' ')[1]
        const payload = this.jwtService.verifyToken<TokenPayload>(token, 'access')
        if (!payload) {
            throw new UnauthorizedException('Invalid or expired access token')
        }

        request.user = payload
        return true
    }
}

@Injectable()
export class RefreshTokenGuard {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const refreshToken = request.cookies?.refreshToken

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is missing')
        }

        try {
            const payload = this.jwtService.verifyToken<TokenPayload>(
                refreshToken,
                'refresh',
            )
            request.user = { ...payload, token: refreshToken } as TokenPayload & {
                token: string
            }
            return true
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token')
        }
    }
}
