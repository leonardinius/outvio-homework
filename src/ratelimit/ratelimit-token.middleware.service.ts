import { Injectable } from '@nestjs/common';
import { RequestKey, RequestTracker } from './tracker.interface';
import { Request } from 'express';
import { RateLimitMiddleware } from './ratelimit.middleware.service';
import { AUTH_TOKEN_HEADER_NAME } from '../auth/auth.middleware';

@Injectable()
export class TokenRateLimitMiddleware extends RateLimitMiddleware {
  constructor() {
    super(new TokenRequestTracker());
  }
}

class TokenRequestTracker implements RequestTracker {
  trackerKey(req: Request): RequestKey {
    return req.header(AUTH_TOKEN_HEADER_NAME);
  }
}
