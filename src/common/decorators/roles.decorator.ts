import { SetMetadata } from '@nestjs/common';
import { UserRoleType } from '../enums/roles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleType[]) => SetMetadata(ROLES_KEY, roles);
