import { Injectable } from '@nestjs/common';
import { BloggerBlogsRepository } from './blogger-blogs.repository';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import { BlogInfoDTO, QueryBlogsDTO } from './applications/blogger-blogs.dto';

@Injectable()
export class BloggerBlogsService {
  constructor(protected bloggerBlogsRepository: BloggerBlogsRepository) {}

  async findAllBlogs(
    queryData: QueryBlogsDTO,
    currentUserId: string,
  ): Promise<Result<Paginated<BlogInfoDTO[]>>> {
    let filter: any = { ownerId: currentUserId };
    if (queryData.searchNameTerm) {
      filter = {
        ownerId: currentUserId,
        name: { $regex: queryData.searchNameTerm, $options: 'i' },
      };
    }
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.bloggerBlogsRepository.totalCountBlogs(
      filter,
    );
    const allBlogs = await this.bloggerBlogsRepository.findAllBlogs(
      filter,
      sort,
      queryData,
    );
    const paginatedBlogs = await Paginated.getPaginated<BlogInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: allBlogs.map(
        (b) =>
          new BlogInfoDTO(
            b._id.toString(),
            b.name,
            b.description,
            b.websiteUrl,
            b.createdAt,
            b.isMembership,
          ),
      ),
    });
    return new Result<Paginated<BlogInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }
}
