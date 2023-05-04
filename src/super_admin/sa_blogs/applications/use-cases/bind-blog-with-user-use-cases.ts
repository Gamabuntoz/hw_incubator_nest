import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { Result, ResultCode } from '../../../../helpers/contract';
import { SABlogsRepository } from '../../sa-blogs.repository';
import { SAUsersRepository } from '../../../sa_users/sa-users.repository';
import { Blog } from '../../../../blogger/blogger_blogs/applications/blogger-blogs.schema';

export class BindBlogWithUserCommand {
  constructor(public blogId: Types.ObjectId, public userId: Types.ObjectId) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCases
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    private saBlogsRepository: SABlogsRepository,
    private saUsersRepository: SAUsersRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<Result<boolean>> {
    const blog: Blog = await this.saBlogsRepository.findBlogById(
      command.blogId,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'blog not found');
    if (blog.ownerId)
      return new Result<boolean>(
        ResultCode.BadRequest,
        false,
        'blog is already has owner',
      );
    const user = await this.saUsersRepository.findUserById(command.userId);
    if (!user)
      return new Result<boolean>(ResultCode.NotFound, false, 'user not found');
    await this.saBlogsRepository.bindBlogWithUser(
      command.blogId,
      command.userId,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
