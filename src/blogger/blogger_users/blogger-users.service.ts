import { Injectable } from '@nestjs/common';
import { BloggerUsersRepository } from './blogger-users.repository';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import {
  BannedUsersForBlogInfoDTO,
  QueryBannedUsersForBlogDTO,
} from './applications/blogger-users.dto';
import { Types } from 'mongoose';
import { BloggerBlogsRepository } from '../blogger_blogs/blogger-blogs.repository';

@Injectable()
export class BloggerUsersService {
  constructor(
    protected bloggerUsersRepository: BloggerUsersRepository,
    protected bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}

  async findAllBannedUsers(
    queryData: QueryBannedUsersForBlogDTO,
    blogId: Types.ObjectId,
    currentUserId: string,
  ): Promise<Result<Paginated<BannedUsersForBlogInfoDTO[]>>> {
    const blog = await this.bloggerBlogsRepository.findBlogById(blogId);
    if (!blog)
      return new Result<Paginated<BannedUsersForBlogInfoDTO[]>>(
        ResultCode.NotFound,
        null,
        'blog not found',
      );
    if (blog.ownerId !== currentUserId)
      return new Result<Paginated<BannedUsersForBlogInfoDTO[]>>(
        ResultCode.Forbidden,
        null,
        'access denied',
      );
    let filter: any = { blogId: blogId.toString(), isBanned: true };
    if (queryData.searchLoginTerm) {
      filter = {
        blogId: blogId.toString(),
        isBanned: true,
        userLogin: { $regex: queryData.searchLoginTerm, $options: 'i' },
      };
    }
    const totalCount =
      await this.bloggerUsersRepository.totalCountBannedUsersForBlog(filter);
    const allBannedUsersForBlog =
      await this.bloggerUsersRepository.findAllBannedUsersForBlog(
        filter,
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
            banDate: b.banDate.toISOString(),
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
