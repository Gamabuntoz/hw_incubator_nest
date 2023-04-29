import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserInfoDTO } from '../users.dto';
import { InputRegistrationDTO } from '../../../auth/applications/auth.dto';
import { UsersService } from '../../users.service';
import { UsersRepository } from '../../users.repository';
import { Result, ResultCode } from '../../../../helpers/contract';

export class CreateConfirmedUserCommand {
  constructor(public inputData: InputRegistrationDTO) {}
}

@CommandHandler(CreateConfirmedUserCommand)
export class CreateConfirmedUseCases
  implements ICommandHandler<CreateConfirmedUserCommand>
{
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    command: CreateConfirmedUserCommand,
  ): Promise<Result<UserInfoDTO>> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.usersService._generateHash(
      command.inputData.password,
      passwordSalt,
    );
    const newUser = {
      _id: new Types.ObjectId(),
      accountData: {
        login: command.inputData.login,
        email: command.inputData.email,
        passwordHash: passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        isConfirmed: true,
        expirationDate: add(new Date(), {
          hours: 1,
        }),
      },
      passwordRecovery: {
        code: 'string',
        expirationDate: new Date(),
      },
    };
    await this.usersRepository.createUser(newUser);
    const userView = new UserInfoDTO(
      newUser._id.toString(),
      newUser.accountData.login,
      newUser.accountData.email,
      newUser.accountData.createdAt,
    );
    return new Result<UserInfoDTO>(ResultCode.Success, userView, null);
  }
}
