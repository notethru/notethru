import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { UserService } from "src/user/user.service";
import { User } from "@prisma/client";
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    private userService;
    constructor(authService: AuthService, userService: UserService);
    validate(username: string, password: string): Promise<User>;
}
export {};
