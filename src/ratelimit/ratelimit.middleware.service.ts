import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestTracker } from './tracker.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const md5 = require('md5');

export abstract class RateLimitMiddleware implements NestMiddleware {
  private headerPrefix = 'X-RateLimit';

  protected constructor(private tracker: RequestTracker) {}

  use(req: Request, res: Response, next: NextFunction) {
    const message = this.requestHash(req);
    console.log(message);
    next();
  }

  private requestHash(req: Request): string {
    // TODO fix
    const prefix = ''; //`${ctx.getClass().name}-${ctx.getHandler().name}`;
    const suffix = this.tracker.trackerKey(req);
    return md5(`${prefix}-${suffix}`);
  }
}
