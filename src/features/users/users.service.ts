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
    const filter = this.usersRepository.createFilter(
      queryData.searchLoginTerm,
      queryData.searchEmailTerm,
    );
    const totalCount = await this.usersRepository.totalCountUsers(filter);
    const findAllUsers = await this.usersRepository.findAllUsers(
      filter,
      queryData,
    );
    const paginatedUsers = await Paginated.getPaginated<UserInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: findAllUsers.map(
        (u) =>
          new UserInfoDTO(
            u._id.toString(),
            u.accountData.login,
            u.accountData.email,
            u.accountData.createdAt,
          ),
      ),
    });

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
