import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  BannedUserForBlog,
  BannedUserForBlogDocument,
} from './applications/banned-users-for-blogs.schema';
import {
  InputBanUserForBlogDTO,
  QueryBannedUsersForBlogDTO,
} from './applications/blogger-users.dto';

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

  async totalCountBannedUsersForBlog(filter: any) {
    return this.bannedUserForBlogModel.countDocuments(filter);
  }

  async checkUserForBan(userId: string, blogId: string) {
    return this.bannedUserForBlogModel.findOne({ userId, blogId });
  }

  async findAllBannedUsersForBlog(
    filter: any,
    queryData: QueryBannedUsersForBlogDTO,
  ) {
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    return this.bannedUserForBlogModel
      .find(filter)
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }
}
