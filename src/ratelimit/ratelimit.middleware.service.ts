import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestTracker } from './tracker.interface';
import { ThrottlerService } from './throttler.service';

export abstract class RateLimitMiddleware implements NestMiddleware {
  private headerPrefix = 'X-RateLimit';

  protected constructor(
    private tracker: RequestTracker,
    private throttler: ThrottlerService,
    private limit: number,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const key = this.tracker.trackerKey(req);
    await this.throttler.ttl(key);
    next();
  }
}
