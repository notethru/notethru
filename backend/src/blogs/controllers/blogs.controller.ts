import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Helpers } from 'src/helpers-non-module';
import { BlogsService } from '../services/blogs.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBlogDTO } from '../dto/create-blog.dto';

// Instance of helpers class
const helpersInstance = new Helpers();

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Get()
  @helpersInstance.Public()
  async getFirstTenBlogs() {
    return await this.blogsService.getFirstTenBlogs();
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('blogs', helpersInstance.saveBlogToStorage))
  async createBlog(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateBlogDTO,
  ) {
    if (!file) {
      throw new BadRequestException('A file with extention .md is required');
    }
    return await this.blogsService.createBlog(body);
  }
}
