import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CurrentUserId } from '../auth/applications/current-user.param.decorator';
import { RefreshTokenPayload } from '../auth/applications/get-refresh-token-payload.param.decorator';
import { RefreshPayloadDTO } from './applications/devices.dto';
import { JwtRefreshAuthGuard } from '../auth/guards/jwt-refresh-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Get()
  findAllUserDevices(@CurrentUserId() currentUserId) {
    return this.devicesService.findAllUserDevices(currentUserId);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Delete()
  deleteAllDevicesExceptCurrent(
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
  ) {
    return this.devicesService.deleteAllDevicesExceptCurrent(tokenPayload);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Delete(':id')
  deleteDevicesById(
    @Param('id') id: string,
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
  ) {
    return this.devicesService.deleteDevicesById(id, tokenPayload);
  }
}
