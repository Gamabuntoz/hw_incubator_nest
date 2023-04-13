import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
  Ip,
  Headers,
  Res,
  BadRequestException,
} from '@nestjs/common';
import {
  InputConfirmationCodeDTO,
  InputEmailDTO,
  InputLoginDTO,
  InputNewPassDTO,
  InputRegistrationDTO,
} from './applications/auth.dto';
import { AuthService } from './auth.service';
import { JwtAccessAuthGuard } from './guards/jwt-access-auth.guard';
import { CurrentUserId } from './applications/current-user.param.decorator';
import { Response } from 'express';
import { RefreshTokenPayload } from './applications/get-refresh-token-payload.param.decorator';
import { RefreshPayloadDTO } from '../devices/applications/devices.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() inputData: InputEmailDTO) {
    return this.authService.passwordRecovery(inputData);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(@Body() inputData: InputNewPassDTO) {
    return this.authService.newPassword(inputData);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() inputData: InputLoginDTO,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(inputData, ip, deviceName);
    if (!result) throw new UnauthorizedException();
    response.cookie('refreshToken', result.refreshToken, {
      secure: true,
      httpOnly: true,
    });
    return { accessToken: result.accessToken };
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshTokens(@RefreshTokenPayload() tokenPayload: RefreshPayloadDTO) {
    return this.authService.refreshTokens(tokenPayload);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmEmail(@Body() inputData: InputConfirmationCodeDTO) {
    const result = await this.authService.confirmEmail(inputData);
    if (!result)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'email already confirmed',
            field: 'code',
          },
        ],
      });
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() inputData: InputRegistrationDTO) {
    const result = await this.authService.registration(inputData);
    if (!result) throw new BadRequestException();
    return result;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendEmail(@Body() inputData: InputEmailDTO) {
    const result = this.authService.resendEmail(inputData);
    if (!result)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'email already confirmed',
            field: 'email',
          },
        ],
      });
    return;
  }

  @UseGuards(JwtRefreshAuthGuard)
  @SkipThrottle()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@RefreshTokenPayload() tokenPayload: RefreshPayloadDTO) {
    return this.authService.logout(tokenPayload);
  }

  @SkipThrottle()
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getInfoAboutCurrentUser(@CurrentUserId() currentUserId) {
    return this.authService.getInfoAboutCurrentUser(currentUserId);
  }
}
