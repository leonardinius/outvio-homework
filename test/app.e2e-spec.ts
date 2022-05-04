import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const config = app.get<ConfigService>(ConfigService);
    authToken = config.get<string>('AUTH_TOKEN');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /private/1 auth check - http 401 no auth', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .expect(401, '{"statusCode":401,"message":"Unauthorized"}');
  });

  it('GET /private/1 auth check - http200 auth', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .set('Authentication', authToken)
      .expect(200, 'Private Ok - 1');
  });

  it('GET /public/1 - http200, no auth', () => {
    return request(app.getHttpServer())
      .get('/public/1')
      .expect(200, 'Public Ok - 1');
  });

  it('GET /private/1 - http429 check for token limit', () => {
    return request(app.getHttpServer())
      .get('/public/1')
      .expect(429)
      .expect('Private token limit - time xxx');
  });

  it('GET /public/1 - http429 check for ip limit', () => {
    return request(app.getHttpServer())
      .get('/public/1')
      .expect(429)
      .expect('Public ip limit - time xxx');
  });

  it('GET /private/{N} - concurrent request', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .expect(429)
      .expect('Private token limit - time xxx');
  });

  it('GET /private/{N} - request weight limit points 1/2/5', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .expect(429)
      .expect('Private token limit - time xxx');
  });
});
