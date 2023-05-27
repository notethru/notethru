import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO } from './dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async create(inputUser: AuthDTO) {
    const userFromDatabase = await this.prisma.user.create({
      data: {
        ...inputUser,
      },
    });
    return userFromDatabase;
  }

  async signin(inputUser: User) {
    const payload = {
      username: inputUser.username,
      id: inputUser.id,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
