import { ApiProperty } from '@nestjs/swagger'
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator'
import { UserRole } from '../../../common/enums/roles'

export class CreateUserDto {
    @ApiProperty({
        example: 'ahmed.sayed.connect@gmail.com',
        description: 'User email address',
    })
    @IsEmail()
    email: string

    @ApiProperty({ example: 'Ahmed Sayed', description: 'Full name of the user' })
    @IsString()
    @IsNotEmpty()
    fullName: string

    @ApiProperty({
        example: '01015029031',
        description: 'User password (min 6 characters)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string

    @ApiProperty({
        example: UserRole.USER,
        description: 'User role',
        enum: UserRole,
        required: false,
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole
}
