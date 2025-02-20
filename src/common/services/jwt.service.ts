import { Inject, Injectable } from '@nestjs/common'
import { JwtSignOptions, JwtService as MainJwtService } from '@nestjs/jwt'
import { CustomConfigService } from '../../config/config.service'
import { TokenPayload } from '../types/token.type'

type TokenType = 'access' | 'refresh' | 'password_reset'

@Injectable()
export class JwtService extends MainJwtService {
  @Inject(CustomConfigService)
  private readonly configService: CustomConfigService

  generateToken<T extends object = TokenPayload>(
    userPayload: T,
    type: TokenType,
  ): string {
    const options: JwtSignOptions = this.getTokenOptions(type)
    return this.sign(userPayload, options)
  }

  verifyToken<T extends object = TokenPayload>(
    token: string,
    type: TokenType,
  ): T | null {
    try {
      return this.verify<T>(token, this.getVerificationOptions(type))
    } catch (err) {
      return null
    }
  }

  generateTokenPayload(user: any, type: TokenType): TokenPayload {
    return {
      sub: user.id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    }
  }

  private getTokenOptions(type: TokenType): JwtSignOptions {
    switch (type) {
      case 'refresh':
        return {
          secret: this.configService.getRefreshTokenSecret(),
          expiresIn: this.getRefershTTL(),
        }
      default:
        return {
          secret: this.configService.getJwtSecret(),
          expiresIn: this.configService.getJwtExpiresIn(),
        }
    }
  }

  private getVerificationOptions(type: TokenType) {
    switch (type) {
      case 'refresh':
        return {
          secret: this.configService.getRefreshTokenSecret(),
          ignoreExpiration: false,
        }
      case 'password_reset':
        return {
          secret: this.configService.getJwtSecret(),
          ignoreExpiration: false,
        }
      default:
        return {
          secret: this.configService.getJwtSecret(),
          ignoreExpiration: true,
        }
    }
  }

  getRefershTTL(): string {
    return this.configService.getRefreshTokenExpiresIn()
  }
}
