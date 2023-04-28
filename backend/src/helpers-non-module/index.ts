import { SetMetadata } from "@nestjs/common"

export class Helpers {
    IS_PUBLIC_KEY = "isPublic"
    Public = () => SetMetadata(this.IS_PUBLIC_KEY, true)
}