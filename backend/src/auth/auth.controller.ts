import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  SetMetadata,
  CustomDecorator,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LocalAuthGuard } from './gaurds/local-auth.gaurd';
import { Helpers } from 'src/helpers-non-module';

const helpersInstance = new Helpers();

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('signup')
  @helpersInstance.Public()
  async createUser(@Body() body: AuthDTO) {
    const user: User | undefined = await this.userService.findUser(
      body.username,
    );
    let saltRounds = 10; //for bcrypt algoridhm
    if (user) {
      throw new BadRequestException('User already exists');
    } else {
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);
      const { password, ...rest } = body;
      const user = await this.authService.create({
        password: hashedPassword,
        ...rest,
      });

      return user;
    }
  }

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  @helpersInstance.Public()
  signin(@Request() req) {
    return this.authService.signin(req.user);
  }
}
