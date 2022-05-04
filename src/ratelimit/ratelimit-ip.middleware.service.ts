import { Injectable } from '@nestjs/common';
import { RequestKey, RequestTracker } from './tracker.interface';
import { Request } from 'express';
import { RateLimitMiddleware } from './ratelimit.middleware.service';
import { ConfigService } from '@nestjs/config';
import { RateLimitStorageService } from './storage-inmem.service';

@Injectable()
export class IpRateLimitMiddleware extends RateLimitMiddleware {
  constructor(private configService: ConfigService) {
    super(
      new IpRequestTracker(),
      new RateLimitStorageService(),
      configService.get<number>('RATELIMIT_IP_LIMIT'),
      configService.get<number>('RATELIMIT_IP_LIMIT_PERIOD'),
    );
  }
}

class IpRequestTracker implements RequestTracker {
  trackerKey(req: Request): RequestKey {
    return req.ip;
  }
}
