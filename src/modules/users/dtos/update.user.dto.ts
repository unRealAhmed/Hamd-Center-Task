import { ApiProperty } from '@nestjs/swagger'
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator'
import { UserRole } from '../../../common/enums/roles'

export class UpdateUserDto {
    @ApiProperty({
        example: 'ahmed.sayed.connect@gmail.com',
        description: 'User email address',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string

    @ApiProperty({
        example: 'Ahmed Sayed',
        description: 'Full name of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    fullName?: string

    @ApiProperty({
        example: '01015029031',
        description: 'User password (min 6 characters)',
        minLength: 6,
        required: false,
    })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string

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
