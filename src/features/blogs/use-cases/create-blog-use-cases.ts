import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogInfoDTO, InputBlogDTO } from '../applications/blogs.dto';
import { BlogsRepository } from '../blogs.repository';

@Injectable()
export class CreateBlogUseCases {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(inputData: InputBlogDTO) {
    const newBlog = {
      _id: new Types.ObjectId(),
      createdAt: new Date().toISOString(),
      name: inputData.name,
      description: inputData.description,
      websiteUrl: inputData.websiteUrl,
      isMembership: false,
    };
    await this.blogsRepository.createBlog(newBlog);
    return new BlogInfoDTO(
      newBlog._id.toString(),
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt,
      newBlog.isMembership,
    );
  }
}
