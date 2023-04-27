import { CanActivate, ExecutionContext } from "@nestjs/common";
export declare class AuthenticatedGaurd implements CanActivate {
    canActivate(context: ExecutionContext): Promise<any>;
}
