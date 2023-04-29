import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users.repository';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeleteUserCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCases implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<Result<boolean>> {
    const deletedUser = await this.usersRepository.deleteUser(command.id);
    if (!deletedUser)
      return new Result<boolean>(ResultCode.NotFound, false, 'User not found');
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}