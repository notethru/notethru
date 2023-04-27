import { AuthService } from './auth.service';
import { AuthDTO } from './dto';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
export declare class AuthController {
    private authService;
    private userService;
    constructor(authService: AuthService, userService: UserService);
    createUser(body: AuthDTO): Promise<User>;
    signin(req: any): Promise<{
        access_token: string;
    }>;
}
