/*
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import {
  CurrentUserInfo,
  InputConfirmationCodeDTO,
  InputEmailDTO,
  InputLoginDTO,
  InputNewPassDTO,
  InputRegistrationDTO,
} from './applications/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    protected authRepository: AuthRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async passwordRecovery(inputData: InputEmailDTO) {
    let user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!user) return false;
    await this.usersRepository.createPasswordRecoveryCode(user._id);
    user = await usersRepository.findUserByLoginOrEmail(email);
    await emailAdapter.sendEmailForPasswordRecovery(user!);
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

  async login(inputData: InputLoginDTO) {
    return true;
  }

  async refreshTokens() {
    return true;
  }

  async registration(inputData: InputRegistrationDTO) {
    return true;
  }

  async logout() {
    return true;
  }

  async newPassword(inputData: InputNewPassDTO) {
    const user = await usersRepository.findUserByRecoveryCode(recoveryCode);
    if (!user) return 'Invalid code';
    if (user.passwordRecovery!.expirationDate < new Date()) return false;
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(newPassword, passwordSalt);
    await usersRepository.updatePassword(user._id, passwordHash);
    return true;
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<userDBType | boolean> {
    const user = await usersRepository.findUserByLoginOrEmail(loginOrEmail);
    if (!user) return false;
    if (!user.emailConfirmation.isConfirmed) return false;
    const passwordHash = await this._generateHash(
      password,
      user.accountData.passwordHash!.slice(0, 29),
    );
    if (user.accountData.passwordHash !== passwordHash) return false;
    return user;
  }

  async confirmEmail(
    inputData: InputConfirmationCodeDTO,
  ): Promise<boolean | string> {
    const user = await usersRepository.findUserByConfirmationCode(code);
    if (!user) return 'User dont exist';
    if (user.emailConfirmation.expirationDate < new Date())
      return 'Confirmation code was expired';
    if (user.emailConfirmation.isConfirmed) return 'Email already confirmed';
    const result = await usersRepository.updateConfirmation(user._id);
    return result;
  }

  async resendEmail(inputData: InputEmailDTO) {
    let user = await usersRepository.findUserByLoginOrEmail(email);
    if (!user) return 'User dont exist';
    if (user.emailConfirmation.isConfirmed) return 'Email already confirmed';
    await usersRepository.resendConfirmation(user._id);
    user = await usersRepository.findUserByLoginOrEmail(email);
    await emailAdapter.sendEmail(user as userDBType);
    return true;
  }
}
*/
