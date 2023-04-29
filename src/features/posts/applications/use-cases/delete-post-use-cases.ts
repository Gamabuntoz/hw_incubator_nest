import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../posts.repository';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeletePostCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCases implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<Result<boolean>> {
    const deletedPost = await this.postsRepository.deletePost(command.id);
    if (!deletedPost)
      return new Result<boolean>(ResultCode.NotFound, false, 'Post not found');
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
