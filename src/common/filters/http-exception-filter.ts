import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { FastifyReply, FastifyRequest } from 'fastify';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const errorResponse = this.createErrorResponse(exception);

    this.logger.error(
      `[${request.method}] ${request.url} - ${errorResponse.statusCode}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(errorResponse.statusCode).send(errorResponse);
  }

  private createErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (this.isValidationError(exception)) {
      return this.handleValidationError(exception);
    }

    return this.handleUnknownError();
  }

  private handleHttpException(exception: HttpException): ErrorResponse {
    const response = exception.getResponse();
    const status = exception.getStatus();

    const message =
      typeof response === 'string'
        ? response
        : (response as { message?: string | string[] })?.message || 'An error occurred';

    return this.buildErrorResponse(status, message, HttpStatus[status]);
  }

  private handleValidationError(errors: ValidationError[]): ErrorResponse {
    const formattedErrors = this.formatValidationErrors(errors);
    return this.buildErrorResponse(HttpStatus.BAD_REQUEST, formattedErrors, 'Bad Request');
  }

  private handleUnknownError(): ErrorResponse {
    return this.buildErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
      'Internal Server Error',
    );
  }

  private buildErrorResponse(statusCode: number, message: string | string[], error: string): ErrorResponse {
    return { statusCode, message, error };
  }

  private isValidationError(exception: unknown): exception is ValidationError[] {
    return Array.isArray(exception) && exception.every((err) => err instanceof ValidationError);
  }

  private formatValidationErrors(errors: ValidationError[]): string[] {
    return errors.map((error) =>
      Object.values(error.constraints ?? {}).join(', '),
    );
  }
}
