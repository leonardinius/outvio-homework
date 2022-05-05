import { RequestKey } from './tracker.interface';
import { RateLimitStorage } from './storage.interface';
import { Injectable } from '@nestjs/common';
import { SystemClock } from '../clock/system-clock.class';
import { Clock } from '../clock/clock.interface';

@Injectable()
export class RateLimitStorageService implements RateLimitStorage {
  private ttls: Record<string, number[]> = {};
  private timeoutIds = new Set();
  constructor(private clock: Clock = new SystemClock()) {}

  public async get(requestKey: RequestKey): Promise<number[]> {
    return this.ttls[requestKey] || [];
  }

  public async store(
    requestKey: RequestKey,
    weight: number,
    ttl: number,
  ): Promise<void> {
    const ttlMilliseconds = ttl * 1000;
    const expire = this.clock.now() + ttlMilliseconds;
    this.ttls[requestKey] = this.ttls[requestKey] || [];
    for (let i = 0; i < weight; i++) {
      this.ttls[requestKey].push(expire);
    }

    const timeoutId = setTimeout(() => {
      this.ttls[requestKey].shift();
      clearTimeout(timeoutId);
      this.timeoutIds.delete(timeoutId);
    }, ttlMilliseconds);
    this.timeoutIds.add(timeoutId);
  }

  public async onApplicationShutdown(): Promise<void> {
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds.clear();
  }
}
