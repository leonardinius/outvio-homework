import { Injectable } from '@nestjs/common';
import { RequestKey, RequestTracker } from './tracker.interface';
import { Request } from 'express';
import { RateLimitMiddleware } from './ratelimit.middleware.service';
import { ConfigService } from '@nestjs/config';
import { ThrottlerService } from './throttler.service';
import { RedisRateLimitStorageService } from './redis-storage.service';

@Injectable()
export class IpRateLimitMiddleware extends RateLimitMiddleware {
  constructor(private configService: ConfigService) {
    super(
      new IpRequestTracker(),
      new ThrottlerService(new RedisRateLimitStorageService()),
      configService.get<number>('RATELIMIT_IP_HOUR_LIMIT'),
    );
  }
}

class IpRequestTracker implements RequestTracker {
  trackerKey(req: Request): RequestKey {
    return req.ip;
  }
}
