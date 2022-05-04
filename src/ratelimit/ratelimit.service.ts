import { Injectable } from '@nestjs/common';
import { RateLimitStorage } from './storage.interface';

@Injectable()
export class RateLimitService {
  private storage: RateLimitStorage;

  constructor(storage: RateLimitStorage) {
    this.storage = storage;
  }

  public ttl(requestKey: string): Promise<number[]> {
    return this.storage.get(requestKey);
  }

  public store(requestKey: string, ttl: number): Promise<void> {
    return this.storage.store(requestKey, ttl);
  }
}
