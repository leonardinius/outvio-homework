import { Injectable } from '@nestjs/common';
import { RequestKey, RequestTracker } from './tracker.interface';
import { Request } from 'express';
import {
  RateLimitMiddleware,
  ThrottleLimits,
} from './ratelimit.middleware.service';
import { AUTH_TOKEN_HEADER_NAME } from '../auth/auth.middleware';
import { ConfigService } from '@nestjs/config';
import { RateLimitStorageService } from './storage-inmem.service';

@Injectable()
export class TokenRateLimitMiddleware extends RateLimitMiddleware {
  constructor(private configService: ConfigService) {
    super(
      new TokenRequestTracker(),
      new RateLimitStorageService(),
      configService.get<ThrottleLimits>('ratelimit.token'),
    );
  }
}

class TokenRequestTracker implements RequestTracker {
  trackerKey(req: Request): RequestKey {
    return req.header(AUTH_TOKEN_HEADER_NAME);
  }
}
