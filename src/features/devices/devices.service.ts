import { Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { AuthDeviceDTO } from './applications/devices.dto';

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
}
