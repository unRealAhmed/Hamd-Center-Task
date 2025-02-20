import { Module } from '@nestjs/common'
import { UserModule } from '../users/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtService } from '../../common/services/jwt.service'
import { HashService } from '../../common/services/hashing.service'

@Module({
    imports: [UserModule],
    controllers: [AuthController],
    providers: [AuthService, JwtService, HashService],
})
export class AuthModule { }
