import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { InputUserDTO, QueryUsersDTO, UserInfoDTO } from './users.dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import add from 'date-fns/add';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async findUsers(term: QueryUsersDTO) {
    const queryData = new QueryUsersDTO(
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
      term.searchLoginTerm,
      term.searchEmailTerm,
    );

    return this.usersRepository.findUsers(queryData);
  }

  async createUser(inputData: InputUserDTO) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      inputData.password,
      passwordSalt,
    );
    const newUser = {
      _id: new Types.ObjectId(),
      accountData: {
        login: inputData.login,
        email: inputData.email,
        passwordHash: passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        isConfirmed: false,
        expirationDate: add(new Date(), {
          hours: 1,
        }),
      },
      passwordRecovery: {
        code: 'string',
        expirationDate: new Date(),
      },
    };
    await this.usersRepository.createUser(newUser);
    return new UserInfoDTO(
      newUser._id.toString(),
      newUser.accountData.login,
      newUser.accountData.email,
      newUser.accountData.createdAt,
    );
  }

  async deleteUser(id: string) {
    return await this.usersRepository.deleteUser(id);
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
