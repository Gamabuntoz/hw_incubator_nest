import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { QueryUsersDTO, UserInfoDTO } from './applications/users.dto';
import * as bcrypt from 'bcrypt';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async findUsers(
    queryData: QueryUsersDTO,
  ): Promise<Result<Paginated<UserInfoDTO[]>>> {
    const paginatedUsers = await this.usersRepository.findAllUsers(queryData);
    return new Result<Paginated<UserInfoDTO[]>>(
      ResultCode.Success,
      paginatedUsers,
      null,
    );
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
