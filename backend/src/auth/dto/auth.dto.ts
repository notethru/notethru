import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

export class AuthDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(35)
    name: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/, 
    { message: "Username must only contain alphanumeric characters, underscore and dot" })
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}