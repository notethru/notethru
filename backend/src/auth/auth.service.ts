import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO } from './dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async create(inputUser: AuthDTO) {
    try {
      const userFromDatabase = await this.prisma.user.create({
        data: {
          ...inputUser,
        },
      });

      const jwtPayload = {
        username: userFromDatabase.username,
        id: userFromDatabase.id
      }
      return { access_token: this.jwtService.sign(jwtPayload) };
    } catch (error) {
      console.log(error.message)
    }
  }

  async signin(inputUser: User) {
    const payload = {
      username: inputUser.username,
      id: inputUser.id,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
