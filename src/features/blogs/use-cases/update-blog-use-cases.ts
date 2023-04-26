import { Types } from 'mongoose';
import { InputBlogDTO } from '../applications/blogs.dto';
import { BlogsRepository } from '../blogs.repository';
import { BlogsService } from '../blogs.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(public id: Types.ObjectId, public inputBlogData: InputBlogDTO) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCases implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsService: BlogsService,
  ) {}

  async execute(command: UpdateBlogCommand) {
    const blog = await this.blogsService.findBlogById(command.id);
    if (!blog) return false;
    return this.blogsRepository.updateBlog(command.id, command.inputBlogData);
  }
}
