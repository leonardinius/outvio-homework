import { RequestKey } from './tracker.interface';
import { RateLimitStorage } from './storage.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisRateLimitStorageService implements RateLimitStorage {
  public async get(requestKey: RequestKey): Promise<number[]> {
    return Promise.resolve([]);
  }

  public async store(requestKey: RequestKey, ttl: number): Promise<void> {
    return Promise.resolve(null);
  }
}
