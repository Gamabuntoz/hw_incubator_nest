import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../comments.repository';
import { Types } from 'mongoose';
import { InputCommentDTO } from '../comments.dto';

export class DeleteCommentCommand {
  constructor(public id: Types.ObjectId, public userId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCases
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand) {
    const findComment = await this.commentsRepository.findCommentById(
      command.id,
    );
    if (!findComment) return false;
    if (findComment.userId !== command.userId) throw new ForbiddenException();
    return this.commentsRepository.deleteComment(command.id);
  }
}
