import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs.repository';
import { BlogsService } from '../../blogs.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeleteBlogCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCases implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsService: BlogsService,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<Result<boolean>> {
    const blog = await this.blogsService.findBlogById(command.id);
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    await this.blogsRepository.deleteBlog(command.id);
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
