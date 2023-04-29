import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../features/users/users.repository';

@ValidatorConstraint({ name: 'ValidateEmailForResendCode', async: true })
@Injectable()
export class ValidateEmailForResendCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}
  async validate(value: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(value);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return `User not found or user already confirmed`;
  }
}
