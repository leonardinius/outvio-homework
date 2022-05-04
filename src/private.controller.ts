import { Controller, Get, Param } from '@nestjs/common';

@Controller('private')
export class PrivateController {
  @Get(':id')
  index(@Param() params): string {
    return `Private Ok - ${params.id}`;
  }
}
