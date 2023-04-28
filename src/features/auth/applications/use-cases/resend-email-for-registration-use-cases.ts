import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputEmailDTO } from '../auth.dto';
import { UsersRepository } from '../../../users/users.repository';
import { EmailAdapter } from '../../../../adapters/email-adapter/email.adapter';

export class ResendEmailCommand {
  constructor(public inputData: InputEmailDTO) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCases
  implements ICommandHandler<ResendEmailCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: ResendEmailCommand) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    await this.usersRepository.setNewConfirmationCode(user);
    const updatedUser = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    await this.emailAdapter.sendEmail(updatedUser);
    return true;
  }
}
