import { Controller, Get, Param } from '@nestjs/common';

@Controller('weight')
export class WeightController {
  @Get(':id')
  index(@Param() params): string {
    return `Weight Ok - ${params.id}`;
  }
}
