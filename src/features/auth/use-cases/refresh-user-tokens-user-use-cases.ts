import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../devices/devices.repository';
import { RefreshPayloadDTO } from '../../devices/applications/devices.dto';
import { AuthService } from '../auth.service';

export class RefreshTokensCommand {
  constructor(public tokenPayload: RefreshPayloadDTO) {}
}

@CommandHandler(RefreshTokensCommand)
export class LogoutUserUseCases
  implements ICommandHandler<RefreshTokensCommand>
{
  constructor(
    private devicesRepository: DevicesRepository,
    private authService: AuthService,
  ) {}

  async execute(command: RefreshTokensCommand) {
    const issueAt = new Date().getTime();
    await this.devicesRepository.updateDeviceInfo(
      command.tokenPayload.issueAt,
      command.tokenPayload.userId,
      issueAt,
    );
    return this.authService.createNewPairTokens(
      command.tokenPayload.userId,
      command.tokenPayload.deviceId,
      issueAt,
    );
  }
}
