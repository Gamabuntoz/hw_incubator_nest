import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { InputBanUserForBlogDTO } from '../blogger-users.dto';
import { BloggerBlogsRepository } from '../../../blogger_blogs/blogger-blogs.repository';
import { BloggerUsersRepository } from '../../blogger-users.repository';
import { UsersRepository } from '../../../../public/users/users.repository';
import { BannedUserForBlog } from '../banned-users-for-blogs.schema';

export class BanUserForBlogCommand {
  constructor(
    public userId: Types.ObjectId,
    public inputData: InputBanUserForBlogDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCases
  implements ICommandHandler<BanUserForBlogCommand>
{
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected bloggerUsersRepository: BloggerUsersRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: BanUserForBlogCommand): Promise<Result<boolean>> {
    const blog = await this.bloggerBlogsRepository.findBlogById(
      new Types.ObjectId(command.inputData.blogId),
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    if (blog.ownerId !== command.currentUserId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    const bannedUser = await this.usersRepository.findUserById(
      command.userId.toString(),
    );
    if (!bannedUser)
      return new Result<boolean>(ResultCode.NotFound, false, 'User not found');
    const updateBanStatus =
      await this.bloggerUsersRepository.updateBannedUserStatusForBlog(
        command.userId,
        command.inputData,
      );
    if (updateBanStatus)
      return new Result<boolean>(ResultCode.Success, true, null);
    const newBannedStatus: BannedUserForBlog = {
      _id: new Types.ObjectId(),
      blogId: command.inputData.blogId,
      isBanned: command.inputData.isBanned,
      banDate: command.inputData.isBanned ? new Date() : null,
      banReason: command.inputData.banReason
        ? command.inputData.banReason
        : null,
      userId: command.userId.toString(),
      userLogin: bannedUser.accountData.login,
    };
    await this.bloggerUsersRepository.createBannedUserStatusForBlog(
      newBannedStatus,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
