import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Helpers } from './helpers-non-module';

const helpersInstance = new Helpers();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @helpersInstance.Public()
  getHello(): string {
    return this.appService.getHello();
  }
}
