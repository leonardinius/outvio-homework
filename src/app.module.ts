import { Module } from '@nestjs/common';
import { PubController } from './pub.controller';

@Module({
  imports: [],
  controllers: [PubController],
  providers: [],
})
export class AppModule {}
