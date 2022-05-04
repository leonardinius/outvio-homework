import { Controller, Get, Param } from '@nestjs/common';

@Controller('public')
export class PubController {
  @Get(':id')
  index(@Param() params): string {
    return `Public Ok - ${params.id}`;
  }
}
