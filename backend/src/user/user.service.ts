import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findUser(username: string): Promise<User | undefined> {
    let user: User | undefined;
    try {
      user = await this.prismaService.user.findUnique({
        where: {
          username: username,
        },
      });
      return user;
    } catch (error) {
      return undefined;
    }
  }

  async findUserById(id: string) {
    let user: User | undefined;
    try {
      user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });
      return user;
    } catch (error) {
      return undefined;
    }
  }
  
  async findUserByEmail(email: string) {
    let user: User | undefined;
    try {
      user = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      return user;
    } catch (error) {
      return undefined;
    }
  }
}
