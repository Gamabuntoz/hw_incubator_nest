import { Injectable } from '@nestjs/common';
import { BloggerUsersRepository } from './blogger-users.repository';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import {
  BannedUsersForBlogInfoDTO,
  QueryBannedUsersForBlogDTO,
} from './applications/blogger-users.dto';
import { Types } from 'mongoose';

@Injectable()
export class BloggerUsersService {
  constructor(protected bloggerUsersRepository: BloggerUsersRepository) {}

  async findAllBannedUsers(
    queryData: QueryBannedUsersForBlogDTO,
    blogId: Types.ObjectId,
  ): Promise<Result<Paginated<BannedUsersForBlogInfoDTO[]>>> {
    let filter: any = { blogId: blogId.toString(), isBanned: true };
    if (queryData.searchLoginTerm) {
      filter = {
        blogId: blogId.toString(),
        isBanned: true,
        userLogin: { $regex: queryData.searchLoginTerm, $options: 'i' },
      };
    }
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount =
      await this.bloggerUsersRepository.totalCountBannedUsersForBlog(filter);
    const allBannedUsersForBlog =
      await this.bloggerUsersRepository.findAllBannedUsersForBlog(
        filter,
        sort,
        queryData,
      );
    const paginatedBlogs = await Paginated.getPaginated<
      BannedUsersForBlogInfoDTO[]
    >({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: allBannedUsersForBlog.map(
        (b) =>
          new BannedUsersForBlogInfoDTO(b.userId, b.userLogin, {
            isBanned: b.isBanned,
            banDate: b.banDate.toString(),
            banReason: b.banReason,
          }),
      ),
    });
    return new Result<Paginated<BannedUsersForBlogInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }
}
