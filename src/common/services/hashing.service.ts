import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashService {
  hash(value: string): Promise<string> {
    return argon2.hash(value, {
      type: argon2.argon2id,
    });
  }

  compare(value: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, value);
  }

  generateRandomCode(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
