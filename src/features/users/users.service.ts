import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import {
  InputUserDTO,
  QueryUsersDTO,
  UserInfoDTO,
} from './applications/users.dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import add from 'date-fns/add';
import { Types } from 'mongoose';
import { tryObjectId } from '../../app.service';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async findUsers(term: QueryUsersDTO) {
    const sortBy = term.sortBy;
    const sortDirection = term.sortDirection;
    const pageNumber = +(term.pageNumber ?? 1);
    const pageSize = +(term.pageSize ?? 10);
    const searchLoginTerm = term.searchLoginTerm;
    const searchEmailTerm = term.searchEmailTerm;
    return this.usersRepository.findUsers(
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    );
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
    tryObjectId(id);
    return await this.usersRepository.deleteUser(id);
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
