import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Helpers } from "src/helpers-non-module";

@Injectable()
export class AuthenticatedGaurd implements CanActivate {

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()

        return request.isAuthenticated()
    }
}