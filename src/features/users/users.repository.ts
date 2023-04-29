import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './applications/users.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { QueryUsersDTO } from './applications/users.dto';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAllUsers(filter: FilterQuery<User>, queryData: QueryUsersDTO) {
    let sort = 'accountData.createdAt';
    if (queryData.sortBy) {
      sort = `accountData.${queryData.sortBy}`;
    }
    return this.userModel
      .find(filter)
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }
  createFilter(searchLoginTerm?, searchEmailTerm?) {
    let filter: any = { $or: [] };

    if (searchLoginTerm) {
      filter['$or'].push({
        'accountData.login': {
          $regex: searchLoginTerm,
          $options: 'i',
        },
      });
    }

    if (searchEmailTerm) {
      filter['$or'].push({
        'accountData.email': {
          $regex: searchEmailTerm,
          $options: 'i',
        },
      });
    }
    if (!searchLoginTerm && !searchEmailTerm) {
      filter = {};
    }
    return filter;
  }

  async totalCountUsers(filter) {
    return this.userModel.countDocuments(filter);
  }

  async createUser(newUser: User) {
    const userInstance = new this.userModel(newUser);
    userInstance._id = newUser._id;
    userInstance.accountData = newUser.accountData;
    userInstance.emailConfirmation = newUser.emailConfirmation;
    userInstance.passwordRecovery = newUser.passwordRecovery;
    await userInstance.save();
    return newUser;
  }

  async findUserById(id: string) {
    return this.userModel.findOne({ _id: new Types.ObjectId(id) });
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.userModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async findUserByRecoveryCode(code: string) {
    return this.userModel.findOne({ 'passwordRecovery.code': code });
  }

  async findUserByConfirmationCode(code: string) {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async updateConfirmation(id: string) {
    await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(id),
      },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return true;
  }

  async setNewConfirmationCode(user: User): Promise<boolean> {
    const newCode = uuidv4();
    const newDate = add(new Date(), {
      hours: 1,
      minutes: 1,
    });
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          'emailConfirmation.confirmationCode': newCode,
          'emailConfirmation.expirationDate': newDate,
        },
      },
    );
    return true;
  }

  async createPasswordRecoveryCode(id: string) {
    const code = uuidv4();
    const date = add(new Date(), {
      hours: 1,
      minutes: 1,
    });
    const userInstance = await this.findUserById(id);
    if (!userInstance) return false;
    userInstance.passwordRecovery.code = code;
    userInstance.passwordRecovery.expirationDate = date;
    await userInstance.save();
    return true;
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const userInstance = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!userInstance) return false;
    userInstance.accountData.passwordHash = passwordHash;
    await userInstance.save();
    return true;
  }

  async deleteUser(id: Types.ObjectId) {
    const result = await this.userModel.deleteOne({
      _id: id,
    });
    return result.deletedCount === 1;
  }
}
