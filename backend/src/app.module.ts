import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BlogsModule } from './blogs/blogs.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGaurd } from './auth/gaurds/jwt-auth.gaurd';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, BlogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
