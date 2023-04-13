import { ForbiddenException, Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { AuthDeviceDTO, RefreshPayloadDTO } from './applications/devices.dto';
import { tryObjectId } from '../../app.service';

@Injectable()
export class DevicesService {
  constructor(protected devicesRepository: DevicesRepository) {}

  async findAllUserDevices(currentUserId: string) {
    const allUserDevices = await this.devicesRepository.findAllUserDevices(
      currentUserId,
    );
    return allUserDevices.map(
      (d) =>
        new AuthDeviceDTO(
          d.ipAddress,
          d.deviceName,
          new Date(d.issueAt).toISOString(),
          d.deviceId,
        ),
    );
  }

  async deleteAllDevicesExceptCurrent(tokenPayload: RefreshPayloadDTO) {
    return this.devicesRepository.deleteAllDevicesExceptCurrent(
      tokenPayload.issueAt,
      tokenPayload.userId,
    );
  }

  async deleteDevicesById(id: string, tokenPayload: RefreshPayloadDTO) {
    tryObjectId(id);
    const device = await this.devicesRepository.findDeviceByDeviceId(id);
    if (!device) return false;
    if (device.userId !== tokenPayload.userId) throw new ForbiddenException();
    return this.devicesRepository.deleteDeviceById(id);
  }
}
