import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../features/users/users.repository';

@ValidatorConstraint({ name: 'ValidatePasswordRecoveryCode', async: true })
@Injectable()
export class ValidatePasswordRecoveryCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByRecoveryCode(value);
    if (!user) return false;
    if (user.passwordRecovery.expirationDate < new Date()) return false;
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return `Code is incorrect or expired`;
  }
}
