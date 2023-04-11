import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtRefreshStrategy } from '../auth/strategies/jwt-refresh.strategy';
import { CurrentUserId } from '../auth/applications/current-user.param.decorator';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(JwtRefreshStrategy)
  @Get()
  findAllUserDevices(@CurrentUserId() currentUserId) {
    return this.devicesService.findAllUserDevices(currentUserId);
  }

  @UseGuards(JwtRefreshStrategy)
  @Delete()
  deleteAllDevicesExceptCurrent(@CurrentUserId() currentUserId) {
    return this.devicesService.deleteAllDevicesExceptCurrent();
  }

  @Delete(':id')
  deleteDevicesById(@Param('id') id: string) {
    return this.devicesService.deleteDevicesById(id);
  }
}
