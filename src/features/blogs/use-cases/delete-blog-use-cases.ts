import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogsRepository } from '../blogs.repository';
import { BlogsService } from '../blogs.service';

@Injectable()
export class DeleteBlogUseCases {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsService: BlogsService,
  ) {}

  async execute(id: Types.ObjectId) {
    const blog = await this.blogsService.findBlogById(id);
    if (!blog) return false;
    return this.blogsRepository.deleteBlog(id);
  }
}
