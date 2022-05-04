import { HttpStatus, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestTracker } from './tracker.interface';
import { RateLimitStorage } from './storage.interface';
import { SystemClock } from '../clock/system-clock.class';
import { Clock } from '../clock/clock.interface';

export interface ThrottleLimits {
  limit: number;
  period: number;
}

export abstract class RateLimitMiddleware implements NestMiddleware {
  private readonly limit: number;
  private readonly period: number;

  protected constructor(
    private tracker: RequestTracker,
    private storage: RateLimitStorage,
    config: ThrottleLimits,
    private clock: Clock = new SystemClock(),
  ) {
    this.limit = config.limit;
    this.period = config.period;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const throttleKey = this.tracker.trackerKey(req);
    const storedTTLs = await this.storage.get(throttleKey);
    const nearestExpiryTime =
      storedTTLs.length > 0
        ? Math.ceil((storedTTLs[0] - this.clock.now()) / 1000)
        : 0;

    const remaining = Math.max(0, this.limit - storedTTLs.length - 1);
    res.header('X-RateLimit-Limit', '' + this.limit);
    res.header('X-RateLimit-Period', '' + this.period);
    if (storedTTLs.length >= this.limit) {
      return res
        .header('Retry-After', '' + nearestExpiryTime)
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .send({
          message: 'Too Many requests',
          'retry-after-seconds': `${nearestExpiryTime}`,
          limit: `${this.limit}`,
          period: `${this.period}`,
        });
    }
    res.header('X-RateLimit-Remaining', '' + remaining);
    res.header('X-RateLimit-Reset', '' + nearestExpiryTime);
    await this.storage.store(throttleKey, this.period);

    next();
  }
}
