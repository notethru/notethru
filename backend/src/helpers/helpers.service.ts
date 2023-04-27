import { Injectable } from '@nestjs/common';

@Injectable()
export class HelpersService {
    createErrorMessage(statusCode: number, message: string) {
        let errorMessage: string;
        switch (statusCode) {
            case 400:
                errorMessage = "Bad Request"
                break;
            default:
                errorMessage = "Unknown"
        }

        return {
            statusCode,
            message,
            error: errorMessage
        }
    }
}
