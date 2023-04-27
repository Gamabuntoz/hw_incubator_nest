import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../devices/devices.repository';
import { Device } from '../../devices/applications/devices.schema';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { jwtConstants } from '../applications/constants';
import { InputLoginDTO } from '../applications/auth.dto';
import { UsersRepository } from '../../users/users.repository';
import { AuthService } from '../auth.service';

export class LoginUserCommand {
  constructor(
    public inputData: InputLoginDTO,
    public ip: string,
    public deviceName: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCases implements ICommandHandler<LoginUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private devicesRepository: DevicesRepository,
    private authService: AuthService,
  ) {}

  async execute(command: LoginUserCommand) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.inputData.loginOrEmail,
    );
    const device: Device = {
      _id: new Types.ObjectId(),
      ipAddress: command.ip,
      deviceName: command.deviceName,
      deviceId: uuidv4(),
      issueAt: new Date().getTime(),
      expiresAt: new Date().getTime() + jwtConstants.expirationRefreshToken,
      userId: user._id.toString(),
    };
    await this.devicesRepository.insertDeviceInfo(device);
    return this.authService.createNewPairTokens(
      device.userId,
      device.deviceId,
      device.issueAt,
    );
  }
}
