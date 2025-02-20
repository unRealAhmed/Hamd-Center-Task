import { Global, Module } from '@nestjs/common'
import InitConfigModule from './config'
import { CustomConfigService } from './config.service'

@Module({
  imports: [InitConfigModule],
  providers: [CustomConfigService],
  exports: [CustomConfigService],
})
@Global()
export class ConfigModule {}
