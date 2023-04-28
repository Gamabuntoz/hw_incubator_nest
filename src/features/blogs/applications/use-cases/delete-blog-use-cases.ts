import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs.repository';
import { BlogsService } from '../../blogs.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCases implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsService: BlogsService,
  ) {}

  async execute(command: DeleteBlogCommand) {
    const blog = await this.blogsService.findBlogById(command.id);
    if (!blog) return false;
    return this.blogsRepository.deleteBlog(command.id);
  }
}
