import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import {
  CurrentUserInfo,
  InputConfirmationCodeDTO,
  InputEmailDTO,
  InputLoginDTO,
  InputNewPassDTO,
  InputRegistrationDTO,
} from './applications/auth.dto';
import { EmailAdapter } from '../../adapters/email.adapters';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Device } from '../devices/applications/devices.schema';
import { jwtConstants } from './applications/constants';
import { JwtService } from '@nestjs/jwt';
import { DevicesRepository } from '../devices/devices.repository';
import { RefreshPayloadDTO } from '../devices/applications/devices.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailAdapter: EmailAdapter,
    protected jwtService: JwtService,
    protected devicesRepository: DevicesRepository,
    protected usersService: UsersService,
  ) {}

  async passwordRecovery(inputData: InputEmailDTO) {
    let user = await this.usersRepository.findUserByLoginOrEmail(
      inputData.email,
    );
    if (!user) return false;
    await this.usersRepository.createPasswordRecoveryCode(user._id.toString());
    user = await this.usersRepository.findUserByLoginOrEmail(inputData.email);
    await this.emailAdapter.sendEmailForPasswordRecovery(user);
    return true;
  }

  async getInfoAboutCurrentUser(id: string) {
    const user = await this.usersRepository.findUserById(id);
    return new CurrentUserInfo(
      user.accountData.email,
      user.accountData.login,
      id,
    );
  }

  async login(inputData: InputLoginDTO, ip: string, deviceName: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      inputData.loginOrEmail,
    );
    const device: Device = {
      _id: new Types.ObjectId(),
      ipAddress: ip,
      deviceName: deviceName,
      deviceId: uuidv4(),
      issueAt: new Date().getTime(),
      expiresAt: new Date().getTime() + jwtConstants.expirationRefreshToken,
      userId: user._id.toString(),
    };
    await this.devicesRepository.insertDeviceInfo(device);
    return this.createNewPairTokens(
      device.userId,
      device.deviceId,
      device.issueAt,
    );
  }

  async refreshTokens(tokenPayload: RefreshPayloadDTO) {
    const issueAt = new Date().getTime();
    await this.devicesRepository.updateDeviceInfo(
      tokenPayload.issueAt,
      tokenPayload.userId,
      issueAt,
    );
    return this.createNewPairTokens(
      tokenPayload.userId,
      tokenPayload.deviceId,
      issueAt,
    );
  }

  async registration(inputData: InputRegistrationDTO) {
    await this.usersService.checkLoginAndEmail(
      inputData.login,
      inputData.email,
    );
    await this.usersService.createUser(inputData);
    const user = await this.usersRepository.findUserByLoginOrEmail(
      inputData.login,
    );
    this.emailAdapter.sendEmail(user);
    return true;
  }

  async logout(tokenPayload: RefreshPayloadDTO) {
    return this.devicesRepository.deleteDevice(
      tokenPayload.issueAt,
      tokenPayload.userId,
    );
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token, { secret: jwtConstants.secretKey });
  }

  async createNewPairTokens(userId: string, deviceId: string, issueAt: number) {
    const accessToken = this.jwtService.sign(
      { userId: userId },
      {
        secret: jwtConstants.secretKey,
        expiresIn: jwtConstants.expirationAccessToken,
      },
    );
    const refreshToken = this.jwtService.sign(
      { userId: userId, deviceId: deviceId, issueAt: issueAt },
      {
        secret: jwtConstants.secretKey,
        expiresIn: jwtConstants.expirationRefreshToken,
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async newPassword(inputData: InputNewPassDTO) {
    const user = await this.usersRepository.findUserByRecoveryCode(
      inputData.recoveryCode,
    );
    if (!user) return 'Invalid code';
    if (user.passwordRecovery.expirationDate < new Date()) return false;
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      inputData.newPassword,
      passwordSalt,
    );
    await this.usersRepository.updatePassword(
      user._id.toString(),
      passwordHash,
    );
    return true;
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async checkCredentials(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );
    if (!user) return false;
    if (!user.emailConfirmation.isConfirmed) return false;
    const passwordHash = await this._generateHash(
      password,
      user.accountData.passwordHash.slice(0, 29),
    );
    if (user.accountData.passwordHash !== passwordHash) return false;
    return true;
  }

  async confirmEmail(inputData: InputConfirmationCodeDTO) {
    const user = await this.usersRepository.findUserByConfirmationCode(
      inputData.code,
    );
    if (!user) return false;
    if (user.emailConfirmation.expirationDate < new Date()) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    return this.usersRepository.updateConfirmation(user._id.toString());
  }

  async resendEmail(inputData: InputEmailDTO) {
    let user = await this.usersRepository.findUserByLoginOrEmail(
      inputData.email,
    );
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    await this.usersRepository.setNewConfirmationCode(user);
    user = await this.usersRepository.findUserByLoginOrEmail(inputData.email);
    console.log(user);
    this.emailAdapter.sendEmail(user);
    return true;
  }
}
