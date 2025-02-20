import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class LoginDto {
    @ApiProperty({ example: 'ahmed.sayed.connect@gmail.com', description: 'User email' })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ example: '01015029031', description: 'User password' })
    @IsNotEmpty()
    password: string
}
