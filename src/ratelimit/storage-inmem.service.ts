import { RequestKey } from './tracker.interface';
import { StoredTTLCounter, RateLimitStorage } from './storage.interface';
import { Injectable } from '@nestjs/common';
import { SystemClock } from '../clock/system-clock.class';
import { Clock } from '../clock/clock.interface';

@Injectable()
export class RateLimitStorageService implements RateLimitStorage {
  private ttlWeights: Record<string, Array<[number, number]>> = {};
  private timeoutIds = new Set();
  constructor(private clock: Clock = new SystemClock()) {}

  public async get(requestKey: RequestKey): Promise<StoredTTLCounter> {
    const ttls = this.ttlWeights[requestKey] || [];
    const firstTtl = ttls.length > 0 ? ttls[0][0] : 0;
    const weightUsed = ttls
      .map((ttlWeight) => ttlWeight[1])
      .reduce((sum, current) => sum + current, 0);
    return {
      ttl: firstTtl,
      used: weightUsed,
    };
  }

  public async store(
    requestKey: RequestKey,
    weight: number,
    ttl: number,
  ): Promise<void> {
    const ttlMilliseconds = ttl * 1000;
    const expire = this.clock.now() + ttlMilliseconds;
    this.ttlWeights[requestKey] = this.ttlWeights[requestKey] || [];
    this.ttlWeights[requestKey].push([expire, weight]);

    const timeoutId = setTimeout(() => {
      this.ttlWeights[requestKey].shift();
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
