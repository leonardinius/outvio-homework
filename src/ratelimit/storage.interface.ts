import { RequestKey } from './tracker.interface';

export interface StoredTTLCounter {
  ttl: number;
  used: number;
}
export interface RateLimitStorage {
  get(requestKey: RequestKey): Promise<StoredTTLCounter>;

  store(requestKey: RequestKey, weight: number, ttl: number): Promise<void>;

  onApplicationShutdown(): Promise<void>;
}
