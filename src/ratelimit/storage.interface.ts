import { RequestKey } from './tracker.interface';

export interface RateLimitStorage {
  get(requestKey: RequestKey): Promise<number[]>;

  store(requestKey: RequestKey, ttl: number): Promise<void>;
}
