import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  BannedUserForBlog,
  BannedUserForBlogDocument,
} from './applications/banned-users-for-blogs.schema';
import { InputBanUserForBlogDTO } from './applications/blogger-users.dto';

@Injectable()
export class BloggerUsersRepository {
  constructor(
    @InjectModel(BannedUserForBlog.name)
    private bannedUserForBlogModel: Model<BannedUserForBlogDocument>,
  ) {}

  async updateBannedUserStatusForBlog(
    userId: Types.ObjectId,
    inputData: InputBanUserForBlogDTO,
  ) {
    const result = await this.bannedUserForBlogModel.updateOne(
      {
        blogId: inputData.blogId,
        userId: userId.toString(),
      },
      {
        $set: {
          isBanned: inputData.isBanned,
          banReason: inputData.isBanned ? inputData.banReason : null,
          banDate: inputData.isBanned ? new Date() : null,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async createBannedUserStatusForBlog(newBannedUserStatus: BannedUserForBlog) {
    return this.bannedUserForBlogModel.create(newBannedUserStatus);
  }
}
