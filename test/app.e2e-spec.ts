import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /private/1 auth check -http 401 no auth', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .expect(401)
      .expect('Please authorize');
  });

  it('GET /private/1 auth check - http200 auth', () => {
    return request(app.getHttpServer())
      .get('/private/1')
      .expect(200)
      .expect('Private Ok');
  });

  it('GET /public/1 - http200, no auth', () => {
    return request(app.getHttpServer())
      .get('/public/1')
      .expect(200)
      .expect('Public Ok - 1');
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
