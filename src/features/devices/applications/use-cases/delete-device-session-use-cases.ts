import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../devices.repository';
import { RefreshPayloadDTO } from '../devices.dto';
import { ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

export class DeleteDeviceSessionCommand {
  constructor(
    public id: Types.ObjectId,
    public tokenPayload: RefreshPayloadDTO,
  ) {}
}

@CommandHandler(DeleteDeviceSessionCommand)
export class DeleteDeviceSessionUseCases
  implements ICommandHandler<DeleteDeviceSessionCommand>
{
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(command: DeleteDeviceSessionCommand) {
    const device = await this.devicesRepository.findDeviceByDeviceId(
      command.id.toString(),
    );
    if (!device) return false;
    if (device.userId !== command.tokenPayload.userId)
      throw new ForbiddenException();
    return this.devicesRepository.deleteDeviceById(command.id.toString());
  }
}
