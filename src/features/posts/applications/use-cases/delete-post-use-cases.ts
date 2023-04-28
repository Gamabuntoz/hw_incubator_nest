import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../posts.repository';

export class DeletePostCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCases implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand) {
    return this.postsRepository.deletePost(command.id);
  }
}
