import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PubController } from './pub.controller';
import { PrivateController } from './private.controller';
import { AuthMiddleware } from './auth/auth.middleware';
import { TokenRateLimitMiddleware } from './ratelimit/ratelimit-token.middleware.service';
import { IpRateLimitMiddleware } from './ratelimit/ratelimit-ip.middleware.service';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [PubController, PrivateController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, TokenRateLimitMiddleware)
      .forRoutes('private');
    consumer.apply(IpRateLimitMiddleware).forRoutes('public');
  }
}
