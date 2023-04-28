import { Controller, Get, Post } from '@nestjs/common';
import { Helpers } from 'src/helpers-non-module';

const helpersInstance = new Helpers()

@Controller('blogs')
export class BlogsController {
    @Get()
    @helpersInstance.Public()
    getFirstTenBlogs() {
        return "Hello world"
    }
}
