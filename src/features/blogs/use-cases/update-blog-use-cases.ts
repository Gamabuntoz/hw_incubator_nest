import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InputBlogDTO } from '../applications/blogs.dto';
import { BlogsRepository } from '../blogs.repository';
import { BlogsService } from '../blogs.service';

@Injectable()
export class UpdateBlogUseCases {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsService: BlogsService,
  ) {}

  async execute(id: Types.ObjectId, inputBlogData: InputBlogDTO) {
    const blog = await this.blogsService.findBlogById(id);
    if (!blog) return false;
    return this.blogsRepository.updateBlog(id, inputBlogData);
  }
}
