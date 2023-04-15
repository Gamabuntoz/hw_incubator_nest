import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../users/users.repository';

@ValidatorConstraint({ name: 'LoginOrEmailExist', async: true })
@Injectable()
export class LoginOrEmailExistRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}
  async validate(value: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(value);
    return user ? false : true;
  }
  defaultMessage(args: ValidationArguments) {
    return `Already exist`;
  }
}
