import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FindManyOptions, ILike } from 'typeorm';
import { AbstractFilter } from '../../../common/abstract/abstract-filter';
import { UserRole, UserRoleType } from '../../../common/enums/roles';
import { User } from '../user.entity';

export class FilterUsersDto extends AbstractFilter<User> {
    @ApiPropertyOptional({ description: 'Filter by email (partial match)' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ description: 'Filter by full name (partial match)' })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({ description: 'Filter by user role', enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRoleType;

    constructor(partial: Partial<FilterUsersDto>) {
        super(partial);
        Object.assign(this, partial);
    }

    override toWhereClause(): FindManyOptions<User>['where'] {
        let where = super.toWhereClause() || {};
        if (this.email) {
            where = { ...where, email: ILike(`%${this.email}%`) };
        }
        if (this.fullName) {
            where = { ...where, fullName: ILike(`%${this.fullName}%`) };
        }
        if (this.role !== undefined) {
            where = { ...where, role: this.role };
        }

        return where;
    }
}
