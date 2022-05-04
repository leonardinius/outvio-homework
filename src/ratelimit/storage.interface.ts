export interface RateLimitStorage {
  get(requestKey: string): Promise<number[]>;

  store(requestKey: string, ttl: number): Promise<void>;
}
