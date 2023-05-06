import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../comments.repository';
import { InputLikeStatusDTO } from '../../../posts/applications/posts.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public id: Types.ObjectId,
    public inputData: InputLikeStatusDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCases
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(
    command: UpdateCommentLikeStatusCommand,
  ): Promise<Result<boolean>> {
    const updateLike = await this.updateCommentLike(
      command.id,
      command.inputData.likeStatus,
      command.currentUserId,
    );
    if (updateLike) return new Result<boolean>(ResultCode.Success, true, null);
    const setLike = await this.setCommentLike(
      command.id,
      command.inputData.likeStatus,
      command.currentUserId,
    );
    if (!setLike)
      return new Result<boolean>(
        ResultCode.NotFound,
        null,
        'Comment not found',
      );
    return new Result<boolean>(ResultCode.Success, true, null);
  }

  private async updateCommentLike(
    commentId: Types.ObjectId,
    likeStatus: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) return false;
    return await this.commentsRepository.updateCommentLike(
      commentId.toString(),
      likeStatus,
      userId,
    );
  }

  private async setCommentLike(
    commentId: Types.ObjectId,
    likeStatus: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) return false;
    const commentLike = {
      _id: new Types.ObjectId(),
      userId: userId,
      commentId: commentId.toString(),
      status: likeStatus,
    };
    await this.commentsRepository.setCommentLike(commentLike);
    return true;
  }
}
