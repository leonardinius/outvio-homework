import { Controller, Get, Param } from '@nestjs/common';

@Controller('public')
export class PrivateController {
  // TODO: remove
  //constructor(private readonly appService: PubService) {}

  @Get(':id')
  index(@Param() params): string {
    return `Private Ok - ${params.id}`;
  }
}
