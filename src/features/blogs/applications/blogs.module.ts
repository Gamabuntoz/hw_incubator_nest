import { Module } from '@nestjs/common';
import { BlogsController } from '../blogs.controller';
import { BlogsRepository } from '../blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs.schema';
import { BlogsService } from '../blogs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository],
  exports: [BlogsService, BlogsRepository],
})
export class BlogsModule {}
