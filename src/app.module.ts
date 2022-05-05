import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PubController } from './pub.controller';
import { PrivateController } from './private.controller';
import { AuthMiddleware } from './auth/auth.middleware';
import { TokenRateLimitMiddleware } from './ratelimit/ratelimit-token.middleware.service';
import { IpRateLimitMiddleware } from './ratelimit/ratelimit-ip.middleware.service';
import configuration from './config/configuration';
import { WeightController } from './weight.controller';
import { IpUrlWeightRateLimitMiddleware } from './ratelimit/ratelimit-ip-url-weights.middleware.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [PubController, PrivateController, WeightController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, TokenRateLimitMiddleware)
      .forRoutes(PrivateController);
    consumer.apply(IpRateLimitMiddleware).forRoutes(PubController);
    consumer.apply(IpUrlWeightRateLimitMiddleware).forRoutes(WeightController);
  }
}
