import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { CurrentUserInfo } from './applications/auth.dto';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from '../../helpers/constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected jwtService: JwtService,
  ) {}

  async getInfoAboutCurrentUser(id: string) {
    const user = await this.usersRepository.findUserById(id);
    return new CurrentUserInfo(
      user.accountData.email,
      user.accountData.login,
      id,
    );
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
}
