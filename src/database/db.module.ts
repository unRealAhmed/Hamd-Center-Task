import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { CustomConfigService } from '../config/config.service';
import { DatabaseService } from './db.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [CustomConfigService],
      useFactory: (configService: CustomConfigService) => ({
        type: 'postgres',
        host: configService.getDbHost(),
        port: Number(configService.getDbPort()),
        username: configService.getDbUserName(),
        password: configService.getDbPassword(),
        database: configService.getDbName(),
        autoLoadEntities: true,
        synchronize: configService.getDbSync(),
        uuidExtension: 'pgcrypto'
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule { }
