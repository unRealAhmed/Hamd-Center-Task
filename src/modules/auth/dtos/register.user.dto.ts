import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator'
import { UserRole, UserRoleType } from '../../../common/enums/roles'

export class RegisterUserDto {
    @ApiProperty({
        example: 'ahmed.sayed.connect@gmail.com',
        description: 'email address',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({
        example: '01015029031',
        description: 'User password (min 6 characters)',
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string

    @ApiProperty({
        example: 'Ahmed Mersal',
        description: 'Full name of the user',
    })
    @IsNotEmpty()
    fullName: string

    @ApiProperty({
        example:
            'user | admin  >> but this will not be available for normal users just showed here for you',
        enum: UserRole,
        description: 'User role',
    })
    @IsEnum(UserRole)
    role?: UserRoleType
}
