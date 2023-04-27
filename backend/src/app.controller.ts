import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGaurd } from 'src/auth/gaurds/jwt-auth.gaurd';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGaurd)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
