import { Types } from 'mongoose';
import { BlogInfoDTO, InputBlogDTO } from '../blogger-blogs.dto';
import { BloggerBlogsRepository } from '../../blogger-blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Blog } from '../blogger-blogs.schema';

export class CreateBlogCommand {
  constructor(public inputData: InputBlogDTO, public currentUserId: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCases implements ICommandHandler<CreateBlogCommand> {
  constructor(private bloggerBlogsRepository: BloggerBlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<Result<BlogInfoDTO>> {
    const newBlog: Blog = {
      _id: new Types.ObjectId(),
      createdAt: new Date().toISOString(),
      name: command.inputData.name,
      description: command.inputData.description,
      websiteUrl: command.inputData.websiteUrl,
      isMembership: false,
      ownerId: command.currentUserId,
    };
    await this.bloggerBlogsRepository.createBlog(newBlog);
    const blogView = new BlogInfoDTO(
      newBlog._id.toString(),
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt,
      newBlog.isMembership,
    );
    return new Result<BlogInfoDTO>(ResultCode.Success, blogView, null);
  }
}
