import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../posts.repository';
import { InputPostWithIdDTO } from '../posts.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class UpdatePostCommand {
  constructor(
    public id: Types.ObjectId,
    public inputPostData: InputPostWithIdDTO,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCases implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand): Promise<Result<boolean>> {
    const updatedPost = await this.postsRepository.updatePost(
      command.id,
      command.inputPostData,
    );
    if (!updatedPost)
      return new Result<boolean>(ResultCode.NotFound, false, 'Post not found');
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
