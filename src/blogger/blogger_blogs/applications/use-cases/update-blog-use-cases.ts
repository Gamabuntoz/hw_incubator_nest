import { Types } from 'mongoose';
import { InputBlogDTO } from '../blogger-blogs.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRepository } from '../../blogger-blogs.repository';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Blog } from '../blogger-blogs.schema';

export class UpdateBlogCommand {
  constructor(
    public id: Types.ObjectId,
    public inputBlogData: InputBlogDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCases implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected bloggerBlogsRepository: BloggerBlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<Result<boolean>> {
    const blog: Blog = await this.bloggerBlogsRepository.findBlogById(
      command.id,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    if (blog.ownerId !== command.currentUserId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    await this.bloggerBlogsRepository.updateBlog(
      command.id,
      command.inputBlogData,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
