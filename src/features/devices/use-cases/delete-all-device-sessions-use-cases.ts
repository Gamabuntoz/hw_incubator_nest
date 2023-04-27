import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../devices.repository';
import { RefreshPayloadDTO } from '../applications/devices.dto';

export class DeleteAllDeviceSessionsCommand {
  constructor(public tokenPayload: RefreshPayloadDTO) {}
}

@CommandHandler(DeleteAllDeviceSessionsCommand)
export class DeleteAllDeviceSessionsUseCases
  implements ICommandHandler<DeleteAllDeviceSessionsCommand>
{
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(command: DeleteAllDeviceSessionsCommand) {
    return this.devicesRepository.deleteAllDevicesExceptCurrent(
      command.tokenPayload.issueAt,
      command.tokenPayload.userId,
    );
  }
}
