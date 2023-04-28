import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { PostsRepository } from '../posts/posts.repository';
import { PostsService } from '../posts/posts.service';
import {
  AllPostsInfoDTO,
  QueryPostsDTO,
} from '../posts/applications/posts.dto';
import { Types } from 'mongoose';
import {
  AllBlogsInfoDTO,
  BlogInfoDTO,
  QueryBlogsDTO,
} from './applications/blogs.dto';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    protected postsService: PostsService,
  ) {}

  async findAllPostsByBlogId(
    id: Types.ObjectId,
    term: QueryPostsDTO,
    userId?: string,
  ) {
    const blogById = await this.findBlogById(id);
    if (!blogById) return false;
    const queryData = new QueryPostsDTO(
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
    );
    const totalCount = await this.postsRepository.totalCountPostsByBlogId(
      id.toString(),
    );
    const allPosts = await this.postsRepository.findAllPostsByBlogId(
      id.toString(),
      queryData,
    );
    return new AllPostsInfoDTO(
      Math.ceil(totalCount / queryData.pageSize),
      queryData.pageNumber,
      queryData.pageSize,
      totalCount,
      await Promise.all(
        allPosts.map(async (p) => {
          let likeStatusCurrentUser;
          if (userId) {
            likeStatusCurrentUser =
              await this.postsRepository.findPostLikeByPostAndUserId(
                p._id.toString(),
                userId,
              );
          }
          const lastPostLikes = await this.postsRepository.findLastPostLikes(
            p._id.toString(),
          );
          return this.postsService.createPostViewInfo(
            p,
            lastPostLikes,
            likeStatusCurrentUser,
          );
        }),
      ),
    );
  }

  async findAllBlogs(term: QueryBlogsDTO) {
    const queryData = new QueryBlogsDTO(
      term.searchNameTerm,
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
    );
    let filter = {};
    if (queryData.searchNameTerm) {
      filter = { name: { $regex: queryData.searchNameTerm, $options: 'i' } };
    }
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.blogsRepository.totalCountBlogs(filter);
    const allBlogs = await this.blogsRepository.findAllBlogs(
      filter,
      sort,
      queryData,
    );

    return new AllBlogsInfoDTO(
      Math.ceil(totalCount / queryData.pageSize),
      queryData.pageNumber,
      queryData.pageSize,
      totalCount,
      allBlogs.map(
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
    );
  }

  async findBlogById(id: Types.ObjectId) {
    const blogById = await this.blogsRepository.findBlogById(id);
    if (!blogById) return false;
    return new BlogInfoDTO(
      blogById._id.toString(),
      blogById.name,
      blogById.description,
      blogById.websiteUrl,
      blogById.createdAt,
      blogById.isMembership,
    );
  }
}
