import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt"
import { User } from "@prisma/client";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService,
        private userService: UserService) {
        super() //if strategy requires any config
    }

    async validate(username: string, password: string): Promise<User> {
        try {
            const user = await this.userService.findUser(username)
            

            const isUserPasswordCorrect = await bcrypt.compare(password, user.password)
            if (!isUserPasswordCorrect || !user) {
                throw new UnauthorizedException()
            }
            return user
        } catch (error) {
            console.log(error.message)
        }

    }
}