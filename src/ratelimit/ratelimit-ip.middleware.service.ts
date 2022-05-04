import { Injectable } from '@nestjs/common';
import { RequestKey, RequestTracker } from './tracker.interface';
import { Request } from 'express';
import { RateLimitMiddleware } from './ratelimit.middleware.service';

@Injectable()
export class IpRateLimitMiddleware extends RateLimitMiddleware {
  constructor() {
    super(new IpRequestTracker());
  }
}

class IpRequestTracker implements RequestTracker {
  trackerKey(req: Request): RequestKey {
    return req.ip;
  }
}
