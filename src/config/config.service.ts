import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  private readonly configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }

  isDev(): boolean {
    return this.getNodeEnv() === 'DEV';
  }

  get<T>(key: string, def?: T): T {
    return this.configService.get<T>(key) || (def as T);
  }

  getBoolean(key: string, def = false): boolean {
    const value = this.configService.get<string>(key);
    return value === 'true' ? true : value === 'false' ? false : def;
  }

  getNodeEnv(): string {
    return this.get<string>('NODE_ENV', 'DEV');
  }

  getAppPort(): string {
    return this.get<string>('APP_PORT', '8000');
  }

  getDbHost(): string {
    return this.get<string>('DB_HOST', 'localhost');
  }

  getDbPort(): string {
    return this.get<string>('DB_PORT', '');
  }

  getDbUserName(): string {
    return this.get<string>('DB_USERNAME', '');
  }

  getDbPassword(): string {
    return this.get<string>('DB_PASSWORD', '');
  }

  getDbName(): string {
    return this.get<string>('DB_DATABASE', '');
  }

  getDbSync(): boolean {
    return this.getBoolean('DB_SYNCHRONIZE', false);
  }

  getJwtSecret(): string {
    return this.get<string>('JWT_SECRET_KEY', '');
  }

  getRefreshTokenSecret(): string {
    return this.get<string>('JWT_REFRESH_SECRET_KEY', '');
  }

  getCookieSecret(): string {
    return this.get<string>('COOKIE_SECRET', '');
  }

  getJwtExpiresIn(): string {
    return this.get<string>('JWT_EXPIRES_IN', '');
  }

  getRefreshTokenExpiresIn(): string {
    return this.get<string>('TTL_REFRESH_TOKEN', '');
  }
}
