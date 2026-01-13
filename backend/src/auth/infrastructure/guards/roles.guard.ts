import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => {
  return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(ROLES_KEY, roles, target);
    return target;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.rol) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción');
    }

    const normalizeRole = (role: string) => role.toUpperCase().replace(/\s+/g, '_');

    const userRoleNormalized = normalizeRole(user.rol);
    const hasRole = requiredRoles.some((role) => 
      userRoleNormalized === normalizeRole(role) || 
      userRoleNormalized === 'SUPER_ADMIN' // SUPER_ADMIN tiene acceso a todo
    );

    if (!hasRole) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción');
    }

    return true;
  }
}
