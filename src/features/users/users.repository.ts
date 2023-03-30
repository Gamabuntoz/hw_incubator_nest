import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model, Types } from 'mongoose';
import { QueryUsersDTO, AllUsersInfoDTO, UserInfoDTO } from './users.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUsers(queryData: QueryUsersDTO) {
    let filter = {};
    if (queryData.searchLoginTerm || queryData.searchEmailTerm) {
      filter = {
        $or: [
          { login: { $regex: queryData.searchLoginTerm, $options: '$i' } },
          { email: { $regex: queryData.searchEmailTerm, $options: '$i' } },
        ],
      };
    }
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.userModel.countDocuments(filter);
    const findAllUsers = await this.userModel
      .find(filter)
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();

    return new AllUsersInfoDTO(
      Math.ceil(totalCount / queryData.pageSize),
      queryData.pageNumber,
      queryData.pageSize,
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

  async deleteUser(id: string) {
    const result = await this.userModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    return result.deletedCount === 1;
  }
}
