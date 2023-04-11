import { Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { authDeviceDTO } from './applications/devices.dto';
import { tryObjectId } from '../../app.service';

@Injectable()
export class DevicesService {
  constructor(protected deviceRepository: DevicesRepository) {}

  async findAllUserDevices(currentUserId: string) {
    const allUserDevices = await this.deviceRepository.findAllUserDevices(
      currentUserId,
    );
    return allUserDevices.map(
      (d) =>
        new authDeviceDTO(
          d.ipAddress,
          d.deviceName,
          new Date(d.issueAt).toISOString(),
          d.deviceId,
        ),
    );
  }

  async deleteAllDevicesExceptCurrent() {
    return `This action returns all devices`;
  }

  async deleteDevicesById(id: string) {
    tryObjectId(id);
    return `This action returns a #${id} device`;
  }
}
