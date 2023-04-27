import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputEmailDTO } from '../applications/auth.dto';
import { UsersRepository } from '../../users/users.repository';
import { EmailAdapter } from '../../../adapters/email.adapters';

export class PasswordRecoveryCommand {
  constructor(public inputData: InputEmailDTO) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCases
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    let user = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    if (!user) return false;
    await this.usersRepository.createPasswordRecoveryCode(user._id.toString());
    user = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.email,
    );
    await this.emailAdapter.sendEmailForPasswordRecovery(user);
    return true;
  }
}
