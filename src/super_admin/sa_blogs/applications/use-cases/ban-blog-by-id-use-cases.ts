import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { Result, ResultCode } from '../../../../helpers/contract';
import { SABlogsRepository } from '../../sa-blogs.repository';
import { Blog } from '../../../../blogger/blogger_blogs/applications/blogger-blogs.schema';
import { BlogBanDTO } from '../sa-blogs.dto';

export class BanBlogByIdCommand {
  constructor(public blogId: Types.ObjectId, public blogBanState: BlogBanDTO) {}
}

@CommandHandler(BanBlogByIdCommand)
export class BanBlogByIdUseCases
  implements ICommandHandler<BanBlogByIdCommand>
{
  constructor(private saBlogsRepository: SABlogsRepository) {}

  async execute(command: BanBlogByIdCommand): Promise<Result<boolean>> {
    const blog: Blog = await this.saBlogsRepository.findBlogById(
      command.blogId,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'blog not found');
    if (blog.banInformation.isBanned === command.blogBanState.isBanned)
      return new Result<boolean>(
        ResultCode.Success,
        true,
        'blog is already have input ban status',
      );
    await this.saBlogsRepository.banBlogById(
      command.blogId,
      command.blogBanState.isBanned,
    );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
