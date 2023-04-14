import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CurrentUserId } from '../auth/applications/current-user.param.decorator';
import { RefreshTokenPayload } from '../auth/applications/get-refresh-token-payload.param.decorator';
import { RefreshPayloadDTO } from './applications/devices.dto';
import { JwtRefreshAuthGuard } from '../auth/guards/jwt-refresh-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('security/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @Get()
  async findAllUserDevices(@CurrentUserId() currentUserId) {
    return this.devicesService.findAllUserDevices(currentUserId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  @Delete()
  async deleteAllDevicesExceptCurrent(
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
  ) {
    return this.devicesService.deleteAllDevicesExceptCurrent(tokenPayload);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  @Delete(':id')
  async deleteDevicesById(
    @Param('id') id: string,
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
  ) {
    const result = await this.devicesService.deleteDevicesById(
      id,
      tokenPayload,
    );
    if (!result) throw new NotFoundException();
    return result;
  }
}
