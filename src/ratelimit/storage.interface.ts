import { RequestKey } from './tracker.interface';
import { OnApplicationShutdown } from '@nestjs/common';

export interface RateLimitStorage {
  get(requestKey: RequestKey): Promise<number[]>;

  store(requestKey: RequestKey, ttl: number): Promise<void>;

  onApplicationShutdown(): Promise<void>;
}
