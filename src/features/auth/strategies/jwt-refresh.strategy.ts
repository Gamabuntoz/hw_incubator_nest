import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../applications/constants';
import { Request } from 'express';
import { DevicesRepository } from '../../devices/devices.repository';
import { request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(protected devicesRepository: DevicesRepository) {
    super({
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secretKey,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const data = req?.cookies['refreshToken'];
          if (!data) return null;
          return data;
        },
      ]),
    });
  }
  async validate(payload: any) {
    console.log(payload + ' refresh strategy');
    const device = await this.devicesRepository.findDeviceByDateAndUserId(
      payload.issueAt,
      payload.userId,
    );
    if (!device) throw new UnauthorizedException();
    request.user = {
      userId: payload.userId,
      deviceId: payload.deviceId,
      issueAt: payload.issueAt,
    };
    return;
  }
}
