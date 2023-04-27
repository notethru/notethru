"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGaurd = void 0;
const passport_1 = require("@nestjs/passport");
class JwtAuthGaurd extends (0, passport_1.AuthGuard)("jwt") {
}
exports.JwtAuthGaurd = JwtAuthGaurd;
//# sourceMappingURL=jwt-auth.gaurd.js.map