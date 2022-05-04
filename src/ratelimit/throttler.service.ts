import { Injectable } from '@nestjs/common';
import { RateLimitStorage } from './storage.interface';
import { RequestKey } from './tracker.interface';

@Injectable()
export class ThrottlerService {
  private storage: RateLimitStorage;

  constructor(storage: RateLimitStorage) {
    this.storage = storage;
  }

  public ttl(requestKey: RequestKey): Promise<number[]> {
    return this.storage.get(requestKey);
  }

  public store(requestKey: RequestKey, ttl: number): Promise<void> {
    return this.storage.store(requestKey, ttl);
  }
}
