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
      parseInt(configService.get<string>('RATELIMIT_IP_LIMIT')),
      parseInt(configService.get<string>('RATELIMIT_IP_LIMIT_PERIOD')),
    );
  }
}

class IpRequestTracker implements RequestTracker {
  trackerKey(req: Request): RequestKey {
    return req.ip;
  }
}
