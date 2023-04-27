import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../users/users.repository';
import { AuthService } from '../auth.service';
import { InputNewPassDTO } from '../applications/auth.dto';

export class NewPasswordCommand {
  constructor(public inputData: InputNewPassDTO) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCases
  implements ICommandHandler<NewPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private authService: AuthService,
  ) {}

  async execute(command: NewPasswordCommand) {
    const user = await this.usersRepository.findUserByRecoveryCode(
      command.inputData.recoveryCode,
    );
    if (!user) return 'Invalid code';
    if (user.passwordRecovery.expirationDate < new Date()) return false;
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.authService._generateHash(
      command.inputData.newPassword,
      passwordSalt,
    );
    await this.usersRepository.updatePassword(
      user._id.toString(),
      passwordHash,
    );
    return true;
  }
}
