import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { InputConfirmationCodeDTO } from '../auth.dto';

export class ConfirmEmailCommand {
  constructor(public inputData: InputConfirmationCodeDTO) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCases
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand) {
    const user = await this.usersRepository.findUserByConfirmationCode(
      command.inputData.code,
    );
    if (!user) return false;
    if (user.emailConfirmation.expirationDate < new Date()) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    return this.usersRepository.updateConfirmation(user._id.toString());
  }
}
