import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthTokens } from '../src/auth/auth.middleware';
import { ThrottleLimits } from '../src/ratelimit/ratelimit.middleware.service';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let authToken1, authToken2: string;
  let tokenLimits, ipLimits: ThrottleLimits;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const config = app.get<ConfigService>(ConfigService);
    // FIXME - dependency injection, the proper way would
    //  be to pass the parameters from the test to the registry.
    [authToken1, authToken2] = config.get<AuthTokens>('auth').tokens;
    tokenLimits = config.get<ThrottleLimits>('ratelimit.private_token');
    ipLimits = config.get<ThrottleLimits>('ratelimit.public_ip');

    await app.init();
  });

  const consumeAllPrivateLimits = async (url: string, token: string) => {
    for (let i = 1; i <= tokenLimits.limit; i++) {
      await request(app.getHttpServer())
        .get(url)
        .set('Authentication', token)
        .expect(200, /Private Ok/);
    }
  };

  const assertPrivateIsRateLimitBlocked = async (
    url: string,
    token: string,
  ) => {
    request(app.getHttpServer())
      .get(url)
      .set('Authentication', token)
      .expect(429)
      .expect({
        message: 'Too Many requests',
        'retry-after-seconds': `${tokenLimits.period}`,
        limit: `${tokenLimits.limit}`,
        period: `${tokenLimits.period}`,
      });
  };

  const consumeAllPublicLimits = async (url: string) => {
    for (let i = 1; i <= ipLimits.limit; i++) {
      await request(app.getHttpServer())
        .get(url)
        .expect(200, /Public Ok/);
    }
  };

  const assertPublicIsRateLimitBlocked = async (url: string) => {
    request(app.getHttpServer())
      .get(url)
      .expect(429)
      .expect({
        message: 'Too Many requests',
        'retry-after-seconds': `${ipLimits.period}`,
        limit: `${ipLimits.limit}`,
        period: `${ipLimits.period}`,
      });
  };

  afterEach(async () => {
    await app.close();
  });

  it('GET /private/1 auth check - http 401 no auth', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .expect(401, 'Unauthorized');
  });

  it('GET /private/1 auth token1 check - http200 auth', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .set('Authentication', authToken1)
      .expect(200, 'Private Ok - 1');
  });

  it('GET /private/2 auth token2 - http200 auth', () => {
    return request(app.getHttpServer())
      .get('/private/2')
      .set('Authentication', authToken2)
      .expect(200, 'Private Ok - 2');
  });

  it('GET /public/1 - http200, no auth', () => {
    return request(app.getHttpServer())
      .get('/public/1')
      .expect(200, 'Public Ok - 1');
  });

  it('GET /private/1 - http429 check for token limit', async () => {
    // spend all rate limit budget
    await consumeAllPrivateLimits('/private/1', authToken1);
    // try one more time
    return await assertPrivateIsRateLimitBlocked('/private/1', authToken1);
  });

  it('GET /private/1 - check token1, token2 limits are separate', async () => {
    // spend all rate limit budget
    await consumeAllPrivateLimits('/private/1', authToken1);
    // try one more time
    await assertPrivateIsRateLimitBlocked('/private/1', authToken1);

    // now try with different auth token, should succeed http 200
    return request(app.getHttpServer())
      .get('/private/1')
      .set('Authentication', authToken2)
      .expect(200, /Private Ok/);
  });

  it('GET /public/1 - http429 check for ip limit', async () => {
    // spend all rate limit budget
    await consumeAllPublicLimits('/public/1');
    // try one more time
    return await assertPublicIsRateLimitBlocked('/public/1');
  });

  it('GET /public/1 - check for different IPs limits', async () => {
    await consumeAllPublicLimits('/public/1');
    // try one more time
    await assertPublicIsRateLimitBlocked('/public/1');

    // now try with different ip address, should succeed http 200
    app.set('trust proxy', 1);
    await request(app.getHttpServer())
      .get('/public/1')
      .set('X-Forwarded-For', '172.99.99.1')
      .expect(200, /Public Ok/);
  });

  it('GET /private/{N} - request weight limit points 1/2/5', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .expect(429)
      .expect('Private token limit - time xxx');
  });
});
