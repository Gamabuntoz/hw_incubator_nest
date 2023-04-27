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
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { LogoutUserCommand } from './use-cases/logout-user-use-cases';
import { ResendEmailCommand } from './use-cases/resend-email-for-registration-use-cases';
import { RegistrationUserCommand } from './use-cases/registration-user-use-cases';
import { ConfirmEmailCommand } from './use-cases/confirm-email-for-registration-use-cases';
import { RefreshTokensCommand } from './use-cases/refresh-user-tokens-user-use-cases';
import { LoginUserCommand } from './use-cases/login-user-use-cases';
import { NewPasswordCommand } from './use-cases/new-user-password-use-cases';
import { PasswordRecoveryCommand } from './use-cases/recovery-user-password-use-cases';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    private commandBus: CommandBus,
  ) {}
  //
  //
  // Query controller
  //
  //
  @SkipThrottle()
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getInfoAboutCurrentUser(@CurrentUserId() currentUserId) {
    return this.authService.getInfoAboutCurrentUser(currentUserId);
  }
  //
  //
  // Command controller
  //
  //
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() inputData: InputEmailDTO) {
    return this.commandBus.execute(new PasswordRecoveryCommand(inputData));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(@Body() inputData: InputNewPassDTO) {
    return this.commandBus.execute(new NewPasswordCommand(inputData));
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() inputData: InputLoginDTO,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.commandBus.execute(
      new LoginUserCommand(inputData, ip, deviceName),
    );
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
  async refreshTokens(
    @RefreshTokenPayload() tokenPayload: RefreshPayloadDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.commandBus.execute(
      new RefreshTokensCommand(tokenPayload),
    );
    if (!result) throw new UnauthorizedException();
    response.cookie('refreshToken', result.refreshToken, {
      secure: true,
      httpOnly: true,
    });
    return { accessToken: result.accessToken };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmEmail(@Body() inputData: InputConfirmationCodeDTO) {
    const result = await this.commandBus.execute(
      new ConfirmEmailCommand(inputData),
    );
    if (!result)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Wrong confirmation code',
            field: 'code',
          },
        ],
      });
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() inputData: InputRegistrationDTO) {
    const result = await this.commandBus.execute(
      new RegistrationUserCommand(inputData),
    );
    if (!result) throw new BadRequestException();
    return result;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendEmail(@Body() inputData: InputEmailDTO) {
    const result = await this.commandBus.execute(
      new ResendEmailCommand(inputData),
    );
    if (!result)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Wrong email for resend code',
            field: 'email',
          },
        ],
      });
    return;
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@RefreshTokenPayload() tokenPayload: RefreshPayloadDTO) {
    return this.commandBus.execute(new LogoutUserCommand(tokenPayload));
  }
}
