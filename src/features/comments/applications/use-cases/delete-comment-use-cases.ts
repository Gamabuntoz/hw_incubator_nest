import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../comments.repository';
import { Types } from 'mongoose';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeleteCommentCommand {
  constructor(public id: Types.ObjectId, public userId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCases
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<Result<boolean>> {
    const findComment = await this.commentsRepository.findCommentById(
      command.id,
    );
    if (!findComment)
      return new Result<boolean>(
        ResultCode.NotFound,
        false,
        'Comment not found',
      );
    if (findComment.userId !== command.userId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
