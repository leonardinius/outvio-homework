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
    // FIXME - dependency injection
    [authToken1, authToken2] = config.get<AuthTokens>('auth').tokens;
    tokenLimits = config.get<ThrottleLimits>('ratelimit.private_token');
    ipLimits = config.get<ThrottleLimits>('ratelimit.public_ip');

    await app.init();
  });

  afterAll(async () => {
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
    for (let i = 1; i <= tokenLimits.limit; i++) {
      await request(app.getHttpServer())
        .get('/private/1')
        .set('Authentication', authToken1)
        .expect(200, 'Private Ok - 1');
    }

    // try one more time
    return request(app.getHttpServer())
      .get('/private/1')
      .set('Authentication', authToken1)
      .expect(429)
      .expect({
        message: 'Too Many requests',
        'retry-after-seconds': `${tokenLimits.period}`,
        limit: `${tokenLimits.limit}`,
        period: `${tokenLimits.period}`,
      });
  });

  // TODO: refactor big tests
  it('GET /private/1 - check token1, token2 limits are separate', async () => {
    // spend all rate limit budget
    for (let i = 1; i <= tokenLimits.limit; i++) {
      await request(app.getHttpServer())
        .get('/private/1')
        .set('Authentication', authToken1)
        .expect(200, 'Private Ok - 1');
    }
    // try one more time
    await request(app.getHttpServer())
      .get('/private/1')
      .set('Authentication', authToken1)
      .expect(429)
      .expect({
        message: 'Too Many requests',
        'retry-after-seconds': `${tokenLimits.period}`,
        limit: `${tokenLimits.limit}`,
        period: `${tokenLimits.period}`,
      });

    return request(app.getHttpServer())
      .get('/private/1')
      .set('Authentication', authToken2)
      .expect(200, 'Private Ok - 1');
  });

  it('GET /public/1 - http429 check for ip limit', async () => {
    // spend all rate limit budget
    for (let i = 1; i <= ipLimits.limit; i++) {
      await request(app.getHttpServer())
        .get('/public/1')
        .expect(200, 'Public Ok - 1');
    }

    // try one more time
    return request(app.getHttpServer())
      .get('/public/1')
      .expect(429)
      .expect({
        message: 'Too Many requests',
        'retry-after-seconds': `${ipLimits.period}`,
        limit: `${ipLimits.limit}`,
        period: `${ipLimits.period}`,
      });
  });

  it('GET /public/1 - check for different IPs limits', async () => {
    app.set('trust proxy', 1);
    // spend all rate limit budget
    for (let i = 1; i <= ipLimits.limit; i++) {
      await request(app.getHttpServer())
        .get('/public/1')
        .expect(200, 'Public Ok - 1');
    }
    // try one more time
    await request(app.getHttpServer())
      .get('/public/1')
      .expect(429)
      .expect({
        message: 'Too Many requests',
        'retry-after-seconds': `${ipLimits.period}`,
        limit: `${ipLimits.limit}`,
        period: `${ipLimits.period}`,
      });

    await request(app.getHttpServer())
      .get('/public/1')
      .set('X-Forwarded-For', '172.99.99.1')
      .expect(200, 'Public Ok - 1');
  });

  it('GET /private/{N} - request weight limit points 1/2/5', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .expect(429)
      .expect('Private token limit - time xxx');
  });
});
