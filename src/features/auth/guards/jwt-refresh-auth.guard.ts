import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../applications/constants';
import { DevicesRepository } from '../../devices/devices.repository';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    protected devicesRepository: DevicesRepository,
  ) {}
  public async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException();
    const payload = this.jwtService.verify(refreshToken, {
      secret: jwtConstants.secretKey,
    });
    if (!payload) throw new UnauthorizedException();
    const device = await this.devicesRepository.findDeviceByDateAndUserId(
      payload.issueAt,
      payload.userId,
    );
    if (!device) throw new UnauthorizedException();
    req.user = {
      userId: payload.userId,
      deviceId: payload.deviceId,
      issueAt: payload.issueAt,
    };
    return true;
  }
}