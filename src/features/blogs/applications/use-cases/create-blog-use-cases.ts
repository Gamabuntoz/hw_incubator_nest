import { Types } from 'mongoose';
import { BlogInfoDTO, InputBlogDTO } from '../blogs.dto';
import { BlogsRepository } from '../../blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public inputData: InputBlogDTO) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCases implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand) {
    const newBlog = {
      _id: new Types.ObjectId(),
      createdAt: new Date().toISOString(),
      name: command.inputData.name,
      description: command.inputData.description,
      websiteUrl: command.inputData.websiteUrl,
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
