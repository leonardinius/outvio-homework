import { RequestKey } from './tracker.interface';
import { RateLimitStorage } from './storage.interface';
import { Injectable } from '@nestjs/common';
import { SystemClock } from '../clock/system-clock.class';
import { Clock } from '../clock/clock.interface';
import { clearTimeout } from 'timers';

@Injectable()
export class RateLimitStorageService implements RateLimitStorage {
  private ttls: Record<string, number[]> = {};
  constructor(private clock: Clock = new SystemClock()) {}

  public async get(requestKey: RequestKey): Promise<number[]> {
    return this.ttls[requestKey] || [];
  }

  public async store(requestKey: RequestKey, ttl: number): Promise<void> {
    const ttlMilliseconds = ttl * 1000;
    this.ttls[requestKey] = this.ttls[requestKey] || [];
    this.ttls[requestKey].push(this.clock.now() + ttlMilliseconds);

    const timeoutId = setTimeout(() => {
      this.ttls[requestKey].shift();
      clearTimeout(timeoutId);
    }, ttlMilliseconds);
  }
}
