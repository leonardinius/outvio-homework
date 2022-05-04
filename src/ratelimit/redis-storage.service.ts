import { RequestKey } from './tracker.interface';
import { RateLimitStorage } from './storage.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitStorageService implements RateLimitStorage {
  public get(requestKey: RequestKey): Promise<number[]> {
    return Promise.resolve([]);
  }

  public store(requestKey: RequestKey, ttl: number): Promise<void> {
    return Promise.resolve(null);
  }
}
