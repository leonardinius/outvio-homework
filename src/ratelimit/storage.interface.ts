import { RequestKey } from './tracker.interface';

export interface RateLimitStorage {
  get(requestKey: RequestKey): Promise<number[]>;

  store(requestKey: RequestKey, weight: number, ttl: number): Promise<void>;

  onApplicationShutdown(): Promise<void>;
}
