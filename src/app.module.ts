import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PubController } from './pub.controller';
import { PrivateController } from './private.controller';
import { AuthMiddleware } from './auth.middleware';
import configuration from './config/configuration';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] })],
  controllers: [PubController, PrivateController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('private');
  }
}
