import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

/**
 * @description Converts query params into a given DTO class dynamically
 * @param dtoClass The DTO class to transform the query params into
 */
export function FilterQuery<T>(dtoClass: any) {
  return createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const queryParams = request.query;

    const dtoInstance = plainToInstance(dtoClass, queryParams, { enableImplicitConversion: true });

    const errors = validateSync(dtoInstance as object);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dtoInstance;
  })();
}
