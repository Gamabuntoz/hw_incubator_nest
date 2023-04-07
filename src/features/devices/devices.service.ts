import { Injectable } from '@nestjs/common';

@Injectable()
export class DevicesService {
  create(createDeviceDto) {
    return 'This action adds a new device';
  }

  findAll() {
    return `This action returns all devices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} device`;
  }

  update(id: number, updateDeviceDto) {
    return `This action updates a #${id} device`;
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }
}
