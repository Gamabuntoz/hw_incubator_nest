import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { InputBanUserForBlogDTO } from '../blogger-users.dto';
import { BloggerBlogsRepository } from '../../../blogger_blogs/blogger-blogs.repository';

export class BanUserForBlogCommand {
  constructor(
    public id: Types.ObjectId,
    public inputData: InputBanUserForBlogDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCases
  implements ICommandHandler<BanUserForBlogCommand>
{
  constructor(protected bloggerBlogsRepository: BloggerBlogsRepository) {}

  async execute(command: BanUserForBlogCommand): Promise<Result<boolean>> {
    const blog = await this.bloggerBlogsRepository.findBlogById(command.id);
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    if (blog.ownerId !== command.currentUserId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    // await this.bloggerBlogsRepository.updateBlog(command.id, command.inputData);
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
