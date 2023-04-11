/*
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  InputConfirmationCodeDTO,
  InputEmailDTO,
  InputLoginDTO,
  InputNewPassDTO,
  InputRegistrationDTO,
} from './applications/auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUserId } from './applications/current-user.param.decorator';

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

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() inputData: InputLoginDTO) {
    return this.authService.login(inputData);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshTokens() {
    return this.authService.refreshTokens();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmEmail(@Body() inputData: InputConfirmationCodeDTO) {
    return this.authService.confirmEmail(inputData);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() inputData: InputRegistrationDTO) {
    return this.authService.registration(inputData);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendEmail(@Body() inputData: InputEmailDTO) {
    return this.authService.resendEmail(inputData);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout() {
    return this.authService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getInfoAboutCurrentUser(@CurrentUserId() currentUserId) {
    return this.authService.getInfoAboutCurrentUser(currentUserId);
  }
}
*/
