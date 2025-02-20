import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { isPublic } from '../decorators/Public.decorator';
import { UserRoleType } from '../enums/roles';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        if (isPublic(this.reflector, context)) {
            return true;
        }

        const requiredRoles = this.reflector.getAllAndOverride<UserRoleType[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('Access denied: No role assigned');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Access denied: Insufficient permissions');
        }

        return true;
    }
}
