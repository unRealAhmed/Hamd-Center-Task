import { createParamDecorator, ExecutionContext } from '@nestjs/common';

function booleanify(value: unknown): boolean {
  return value === 'true'
}

export const Paginate = createParamDecorator(
  (
    options: {
      defaultSortKey?: string;
      defaultSortDirection?: 'ASC' | 'DESC';
      defaultPage?: number;
    } = {
        defaultSortKey: 'created_at',
        defaultSortDirection: 'DESC',
        defaultPage: 0,
      },
    context: ExecutionContext,
  ) => {
    const defaultPage = options.defaultPage ?? 0;

    const request = context.switchToHttp().getRequest();

    const requestPage = parseInt(request.query?.page);
    const isValidPage = !isNaN(requestPage) && requestPage > 0;
    const page = isValidPage ? requestPage - 1 : defaultPage;

    const requestLimit = parseInt(request.query?.limit);
    const isValidLimit =
      !isNaN(requestLimit) || requestLimit > 0 || requestLimit < 51;
    let limit = isValidLimit ? requestLimit : 10;
    let skip = page * limit;

    if (requestPage < 1 && defaultPage < 0) {
      limit = 0;
      skip = 0;
    }

    const sortKey = request.query?.sortKey || options.defaultSortKey;
    const sortAsc = booleanify(request.query?.sortAsc)
      ? 1
      : options.defaultSortDirection;

    return {
      page,
      skip,
      limit,
      sortKey,
      sortAsc,
    };
  },
);
