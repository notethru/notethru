import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBlogDTO {
  @IsString()
  @IsNotEmpty()
  topics: string[];
}
