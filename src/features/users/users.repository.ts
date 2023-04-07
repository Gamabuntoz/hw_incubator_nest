import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model, Types } from 'mongoose';
import { AllUsersInfoDTO, UserInfoDTO } from './users.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUsers(
    sortBy: string,
    sortDirection: string,
    pageNumber: number,
    pageSize: number,
    searchLoginTerm: string,
    searchEmailTerm: string,
  ) {
    let filter = {};
    if (searchLoginTerm || searchEmailTerm) {
      filter = {
        $or: [
          { 'accountData.login': { $regex: searchLoginTerm, $options: '$i' } },
          { 'accountData.email': { $regex: searchEmailTerm, $options: '$i' } },
        ],
      };
    }
    let sort = 'accountData.createdAt';
    if (sortBy) {
      sort = `accountData.${sortBy}`;
    }
    const totalCount = await this.userModel.countDocuments(filter);
    const findAllUsers = await this.userModel
      .find(filter)
      .sort({ [sort]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return new AllUsersInfoDTO(
      Math.ceil(totalCount / pageSize),
      pageNumber,
      pageSize,
      totalCount,
      findAllUsers.map(
        (u) =>
          new UserInfoDTO(
            u._id.toString(),
            u.accountData.login,
            u.accountData.email,
            u.accountData.createdAt,
          ),
      ),
    );
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

  async deleteUser(id: string) {
    const result = await this.userModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    return result.deletedCount === 1;
  }
}
