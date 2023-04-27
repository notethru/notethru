import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO } from './dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    create(inputUser: AuthDTO): Promise<User>;
    signin(inputUser: User): Promise<{
        access_token: string;
    }>;
}
