import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { AbstractHttpAdapter } from '@nestjs/core'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ExecutionContextToAbstractResponsePipe } from '../pipes/ctx-to-abstract-response.pipe'
import { TokenPayloadDto } from '../types/token.type'

export type ServerRequest = FastifyRequest
export type ServerRequestWithUser = FastifyRequest & { user: TokenPayloadDto }
export type ServerResponse = FastifyReply

export type WrapperType<T> = T

export class AbstractResponse {
    httpCtx: HttpArgumentsHost

    constructor(
        private readonly httpAdapter: AbstractHttpAdapter,
        readonly executionContext: ExecutionContext,
    ) {
        this.httpCtx = executionContext.switchToHttp()
    }

    setHeader(name: string, value: string): this {
        this.httpAdapter.setHeader(
            this.httpCtx.getResponse<ServerResponse>(),
            name,
            value,
        )
        return this
    }

    setStatus(statusCode: number): this {
        this.httpAdapter.status(
            this.httpCtx.getResponse<ServerResponse>(),
            statusCode,
        )
        return this
    }

    setCookie(
        name: string,
        value: string,
        options: Parameters<ServerResponse['setCookie']>[2] = {},
    ): this {
        this.httpCtx.getResponse<ServerResponse>().setCookie(name, value, options)
        return this
    }

    getCookie(name: string): string | undefined {
        return this.httpCtx.getRequest<ServerResponse>().cookies[name]
    }

    clearCookie(name: string, options: Parameters<ServerResponse['clearCookie']>[1] = {}): this {
        this.httpCtx.getResponse<ServerResponse>().clearCookie(name, options);
        return this;
    }
}

const GetExecutionContext = createParamDecorator(
    (_: never, ctx: ExecutionContext): ExecutionContext => ctx,
)

export const GenericResponse = (): ParameterDecorator =>
    GetExecutionContext(ExecutionContextToAbstractResponsePipe)

export type GenericResponse = AbstractResponse
