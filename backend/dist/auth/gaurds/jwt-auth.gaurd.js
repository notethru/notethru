"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGaurd = void 0;
const passport_1 = require("@nestjs/passport");
const helpers_non_module_1 = require("../../helpers-non-module");
const helpersInstance = new helpers_non_module_1.Helpers();
class JwtAuthGaurd extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(helpersInstance.IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic)
            return true;
        const result = (await super.canActivate(context));
        return result;
    }
}
exports.JwtAuthGaurd = JwtAuthGaurd;
//# sourceMappingURL=jwt-auth.gaurd.js.map