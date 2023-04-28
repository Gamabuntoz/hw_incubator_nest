import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../posts.repository';
import { InputPostWithIdDTO } from '../applications/posts.dto';

export class UpdatePostCommand {
  constructor(
    public id: Types.ObjectId,
    public inputPostData: InputPostWithIdDTO,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCases implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand) {
    return this.postsRepository.updatePost(command.id, command.inputPostData);
  }
}
