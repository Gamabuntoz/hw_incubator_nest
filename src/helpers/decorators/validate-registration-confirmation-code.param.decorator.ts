import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../features/users/users.repository';

@ValidatorConstraint({
  name: 'ValidateRegistrationConfirmationCode',
  async: true,
})
@Injectable()
export class ValidateRegistrationConfirmationCodeRule
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(value: string) {
    const user = await this.usersRepository.findUserByConfirmationCode(value);
    if (!user) return false;
    if (user.emailConfirmation.expirationDate < new Date()) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return `Code is incorrect, expired or already been applied`;
  }
}
