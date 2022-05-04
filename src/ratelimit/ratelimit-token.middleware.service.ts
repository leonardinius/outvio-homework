import { Injectable } from '@nestjs/common';
import { RequestKey, RequestTracker } from './tracker.interface';
import { Request } from 'express';
import { RateLimitMiddleware } from './ratelimit.middleware.service';
import { AUTH_TOKEN_HEADER_NAME } from '../auth/auth.middleware';
import { ConfigService } from '@nestjs/config';
import { ThrottlerService } from './throttler.service';
import { RedisRateLimitStorageService } from './redis-storage.service';

@Injectable()
export class TokenRateLimitMiddleware extends RateLimitMiddleware {
  constructor(private configService: ConfigService) {
    super(
      new TokenRequestTracker(),
      new ThrottlerService(new RedisRateLimitStorageService()),
      configService.get<number>('RATELIMIT_TOKEN_HOUR_LIMIT'),
    );
  }
}

class TokenRequestTracker implements RequestTracker {
  trackerKey(req: Request): RequestKey {
    return req.header(AUTH_TOKEN_HEADER_NAME);
  }
}
