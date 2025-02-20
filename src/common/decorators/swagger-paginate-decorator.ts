import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function SwaggerDocumentationPaginationQuery(): MethodDecorator {
    return applyDecorators(
      ApiQuery({
        name: 'page',
        required: false,
        example: 1,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        example: 10,
        description: 'How many items to recieve',
      }),
      ApiQuery({
        name: 'sortKey',
        required: false,
        example: 'created_at',
        description: 'Which property/key to sort by',
      }),
      ApiQuery({
        name: 'sortAsc',
        required: false,
        enum: ['true', 'false'],
        example: 'false',
        description: 'Sort ascending or descending',
      }),
    )
  }