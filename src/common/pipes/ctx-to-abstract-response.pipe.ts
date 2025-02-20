import { ExecutionContext, Injectable, PipeTransform } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { AbstractResponse } from '../helpers/nest.reponse'

@Injectable()
export class ExecutionContextToAbstractResponsePipe implements PipeTransform {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  transform(ctx: ExecutionContext): AbstractResponse {
    return new AbstractResponse(this.httpAdapterHost.httpAdapter, ctx)
  }
}
