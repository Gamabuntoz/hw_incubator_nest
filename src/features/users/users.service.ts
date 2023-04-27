import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { QueryUsersDTO } from './applications/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async findUsers(term: QueryUsersDTO) {
    const sortBy = term.sortBy;
    const sortDirection = term.sortDirection;
    const pageNumber = +(term.pageNumber ?? 1);
    const pageSize = +(term.pageSize ?? 10);
    return this.usersRepository.findUsers(
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      term.searchLoginTerm,
      term.searchEmailTerm,
    );
  }

  async checkLoginAndEmail(login: string, email: string) {
    const checkLogin = await this.usersRepository.findUserByLoginOrEmail(login);
    if (checkLogin)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'login already exist',
            field: 'login',
          },
        ],
      });
    const checkEmail = await this.usersRepository.findUserByLoginOrEmail(email);
    if (checkEmail)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'email already exist',
            field: 'email',
          },
        ],
      });
    return true;
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
