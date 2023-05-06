import { Injectable } from '@nestjs/common';
import { SABlogsRepository } from './sa-blogs.repository';
import { BlogInfoDTO, QueryBlogsDTO } from './applications/sa-blogs.dto';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import { UsersRepository } from '../../public/users/users.repository';

@Injectable()
export class SABlogsService {
  constructor(
    protected saBlogsRepository: SABlogsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async findAllBlogs(
    queryData: QueryBlogsDTO,
  ): Promise<Result<Paginated<BlogInfoDTO[]>>> {
    let filter = {};
    if (queryData.searchNameTerm) {
      filter = { name: { $regex: queryData.searchNameTerm, $options: 'i' } };
    }
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.saBlogsRepository.totalCountBlogs(filter);
    const allBlogs = await this.saBlogsRepository.findAllBlogs(
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
            {
              userId: b.ownerId,
              userLogin: b.ownerLogin,
            },
            {
              isBanned: b.banInformation.isBanned,
              banDate: b.banInformation.banDate
                ? b.banInformation.banDate.toISOString()
                : null,
            },
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
