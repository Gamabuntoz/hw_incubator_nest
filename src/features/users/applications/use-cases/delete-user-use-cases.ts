import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users.repository';

export class DeleteUserCommand {
  constructor(public id: Types.ObjectId) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCases implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand) {
    return await this.usersRepository.deleteUser(command.id);
  }
}
