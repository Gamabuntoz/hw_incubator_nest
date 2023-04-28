import { Injectable } from '@nestjs/common';
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

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
