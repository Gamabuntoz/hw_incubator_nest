import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../comments.repository';
import { Types } from 'mongoose';
import { InputCommentDTO } from '../applications/comments.dto';

export class UpdateCommentCommand {
  constructor(
    public id: Types.ObjectId,
    public inputData: InputCommentDTO,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCases
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand) {
    const findComment = await this.commentsRepository.findCommentById(
      command.id,
    );
    if (!findComment) return false;
    if (findComment.userId !== command.userId) throw new ForbiddenException();
    return this.commentsRepository.updateComment(command.id, command.inputData);
  }
}
