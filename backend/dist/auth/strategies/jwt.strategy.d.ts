import { Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
interface payloadType {
    username: string;
    id: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userService;
    constructor(userService: UserService);
    validate(payload: payloadType): Promise<import("@prisma/client").User>;
}
export {};
