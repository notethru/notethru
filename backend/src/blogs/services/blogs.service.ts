import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlogDTO } from '../dto/create-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async getFirstTenBlogs() {
    const blogs = this.prisma.blog.findMany({
      where: {},
      take: 10,
    });
    return blogs;
  }

  async createBlog(body: CreateBlogDTO) {
    return 'Hello world';
  }
}
