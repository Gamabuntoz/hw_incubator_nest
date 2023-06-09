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
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { RefreshTokenPayload } from '../../helpers/decorators/get-refresh-token-payload.param.decorator';
import { RefreshPayloadDTO } from './applications/devices.dto';
import { JwtRefreshAuthGuard } from '../../security/guards/jwt-refresh-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteDeviceSessionCommand } from './applications/use-cases/delete-device-session-use-cases';
import { DeleteAllDeviceSessionsCommand } from './applications/use-cases/delete-all-device-sessions-use-cases';
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { Types } from 'mongoose';

@Controller('security/devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private commandBus: CommandBus,
  ) {}
  //
  //
  // Query controller
  //
  //
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @Get()
  async findAllUserDevices(@CurrentUserId() currentUserId) {
    return this.devicesService.findAllUserDevices(currentUserId);
  }
  //
  //
  // Command controller
  //
  //
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  @Delete()
  async deleteAllDevicesExceptCurrent(
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
  ) {
    return this.commandBus.execute(
      new DeleteAllDeviceSessionsCommand(tokenPayload),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  @Delete(':id')
  async deleteDevicesById(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
  ) {
    const result = await this.commandBus.execute(
      new DeleteDeviceSessionCommand(id, tokenPayload),
    );
    if (!result) throw new NotFoundException();
    return result;
  }
}
