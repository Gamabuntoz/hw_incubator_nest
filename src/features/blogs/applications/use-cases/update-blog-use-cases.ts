import { Types } from 'mongoose';
import { InputBlogDTO } from '../blogs.dto';
import { BlogsRepository } from '../../blogs.repository';
import { BlogsService } from '../../blogs.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';

export class UpdateBlogCommand {
  constructor(public id: Types.ObjectId, public inputBlogData: InputBlogDTO) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCases implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsService: BlogsService,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<Result<boolean>> {
    const blog = await this.blogsService.findBlogById(command.id);
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    await this.blogsRepository.updateBlog(command.id, command.inputBlogData);
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
