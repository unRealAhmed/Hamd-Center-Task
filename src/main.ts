import helmet from '@fastify/helmet'
import * as fastifyRateLimit from '@fastify/rate-limit'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { contentParser } from 'fastify-multer'
import { AppModule } from './app.module'
import { CustomConfigService } from './config/config.service'
import { GlobalExceptionFilter } from './common/filters/http-exception-filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import fastifyCookie from '@fastify/cookie'

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  const rejectionLogger = new Logger('UnhandledPromiseRejection')
  rejectionLogger.error(
    `Promise rejection occurred: ${promise instanceof Promise ? promise : JSON.stringify(promise)}, Reason: ${reason}`,
    reason instanceof Error ? reason.stack : reason,
  )
})

process.on('uncaughtException', (error: Error) => {
  const exceptionLogger = new Logger('UncaughtException')
  exceptionLogger.error(
    `Unhandled exception caught: ${error.message}, Stack trace: ${error.stack}`,
    error,
  )
})

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter())

  const logger = new Logger('ApplicationBootstrap')

  const configService = app.get(CustomConfigService)
  const port = configService.getAppPort()

  app.useGlobalInterceptors(new LoggingInterceptor())
  const fastifyInstance = app.getHttpAdapter().getInstance()
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.enableCors({
    credentials: true,
    origin: true,
  })

  fastifyInstance.register(helmet, {
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })

  fastifyInstance.register(contentParser)

  fastifyInstance.register(fastifyCookie, {
    secret: configService.getCookieSecret(),
  });

  fastifyInstance.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  const swaggerOptions = {
    customSiteTitle: 'Hamd Center API Documentation',
    customCss: `
      .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
    `,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      defaultModelsExpandDepth: -1,
    },
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hamd Center Documentation')
    .setDescription('Hamd Center API Documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addCookieAuth('authentication')
    .addSecurityRequirements('bearer')
    .addSecurityRequirements('cookie')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('api', app, document, swaggerOptions)

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Fastify server is running on http://0.0.0.0:${port}`)
    logger.log(`Swagger docs is running on http://0.0.0.0:${port}/api`)
  })
}

bootstrap()
