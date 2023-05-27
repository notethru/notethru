import { Module } from '@nestjs/common';
import { BlogsService } from './services/blogs.service';
import { BlogsController } from './controllers/blogs.controller';
import { watch } from 'chokidar';
import { CompilerService } from './services/compiler.service';

@Module({
  providers: [BlogsService, CompilerService],
  controllers: [BlogsController],
})
export class BlogsModule {
  constructor(
    private blogsService: BlogsService,
    private compiler: CompilerService,
  ) {
    //for watching over new md files coming in blogs folder
    const watcher = watch('./blogs');
    watcher.on('add', async (path) => {
      await compiler.compile(path);
    });
  }
}
