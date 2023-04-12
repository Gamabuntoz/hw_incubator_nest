import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './applications/devices.schema';
import { Model } from 'mongoose';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  async findAllUserDevices(currentUserId: string) {
    return this.deviceModel.find({ userId: currentUserId });
  }
  async findDeviceByDateAndUserId(issueAt: number, userId: string) {
    return this.deviceModel.findOne({ issueAt: issueAt, userId: userId });
  }
  async insertDeviceInfo(device: Device) {
    const deviceInstance = await this.deviceModel.create(device);
    deviceInstance._id = device._id;
    deviceInstance.issueAt = device.issueAt;
    deviceInstance.expiresAt = device.expiresAt;
    deviceInstance.ipAddress = device.ipAddress;
    deviceInstance.deviceName = device.deviceName;
    deviceInstance.userId = device.userId;
    deviceInstance.deviceId = device.deviceId;
    await deviceInstance.save();
    return device;
  }

  async updateDeviceInfo(
    oldIssueAt: number,
    userId: string,
    newIssueAt: number,
  ) {
    const deviceInstance = await this.deviceModel.findOne({
      issueAt: oldIssueAt,
      userId: userId,
    });
    deviceInstance.issueAt = newIssueAt;
    await deviceInstance.save();
    return true;
  }

  async deleteDevice(issueAt: number, userId: string) {
    const result = await this.deviceModel.deleteOne({
      issueAt: issueAt,
      userId: userId,
    });
    return result.deletedCount === 1;
  }
}
