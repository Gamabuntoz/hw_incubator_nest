import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/devices.repository';
import { RefreshPayloadDTO } from '../../../devices/applications/devices.dto';

export class LogoutUserCommand {
  constructor(public tokenPayload: RefreshPayloadDTO) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCases implements ICommandHandler<LogoutUserCommand> {
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(command: LogoutUserCommand) {
    return this.devicesRepository.deleteDevice(
      command.tokenPayload.issueAt,
      command.tokenPayload.userId,
    );
  }
}
