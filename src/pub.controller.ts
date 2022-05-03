import { Controller, Get, Param } from '@nestjs/common';

@Controller('public')
export class PubController {
  // TODO: remove
  //constructor(private readonly appService: PubService) {}

  @Get(':id')
  index(@Param() params): string {
    return `Public Ok - ${params.id}`;
  }
}
