import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private logger = new Logger(LoggingInterceptor.name)

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest()
        const res = context.switchToHttp().getResponse()

        const method = req.method
        const url = req.url
        const controller = context.getClass().name
        const handler = context.getHandler().name

        const tokenPayload = req.user || {}
        const userId = tokenPayload.sub || 'Anonymous'

        const ip = req.headers['x-forwarded-for'] || req.ip
        const userAgent = req.headers['user-agent'] || 'Unknown'

        const requestBody = method !== 'GET' ? JSON.stringify(req.body) : null

        const startTime = Date.now()

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - startTime
                const statusCode = res.statusCode
                const logType = statusCode < 400 ? 'info' : 'warn'
                this.logger.debug(
                    `[${method}] ${url} - ${statusCode} ${duration}ms | User: ${userId} | IP: ${ip} | Controller: ${controller}.${handler} | Agent: ${userAgent}${requestBody ? ` | Body: ${requestBody}` : ''}`,
                    logType,
                )
            }),
        )
    }
}
