import { Injectable } from '@nestjs/common';
import { BloggerBlogsRepository } from './blogger-blogs.repository';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import {
  BloggerBlogInfoDTO,
  BloggerCommentInfoDTO,
  QueryBlogsDTO,
  QueryCommentsDTO,
} from './applications/blogger-blogs.dto';
import { PostsRepository } from '../../public/posts/posts.repository';
import { CommentsRepository } from '../../public/comments/comments.repository';
import { Types } from 'mongoose';

@Injectable()
export class BloggerBlogsService {
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async findAllCommentForBlogger(
    queryData: QueryCommentsDTO,
    currentUserId: string,
  ): Promise<Result<Paginated<BloggerCommentInfoDTO[]>>> {
    const allBlogs = await this.bloggerBlogsRepository.findAllBlogsByOwnerId(
      currentUserId,
    );
    const blogsIds = allBlogs.map((b) => b._id.toString());
    const allPosts = await this.postsRepository.findAllPostsByBlogIds(blogsIds);
    const postsIds = allPosts.map((p) => p._id.toString());
    const totalCount =
      await this.commentsRepository.totalCountCommentsByPostsIds(postsIds);
    const allComments = await this.commentsRepository.findAllCommentsByPostIds(
      postsIds,
      queryData,
    );
    const paginatedBlogs = await Paginated.getPaginated<
      BloggerCommentInfoDTO[]
    >({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
        allComments.map(async (c) => {
          const likeStatusCurrentUser =
            await this.commentsRepository.findCommentLikeByCommentAndUserId(
              c._id.toString(),
              currentUserId,
            );
          const post = await this.postsRepository.findPostById(
            new Types.ObjectId(c.postId),
          );
          return new BloggerCommentInfoDTO(
            c._id.toString(),
            c.content,
            c.createdAt,
            {
              userId: c.userId,
              userLogin: c.userLogin,
            },
            {
              dislikesCount: c.dislikeCount,
              likesCount: c.likeCount,
              myStatus: likeStatusCurrentUser
                ? likeStatusCurrentUser.status
                : 'None',
            },
            {
              id: post._id.toString(),
              title: post.title,
              blogId: post.blogId,
              blogName: post.blogName,
            },
          );
        }),
      ),
    });
    return new Result<Paginated<BloggerCommentInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }

  async findAllBlogs(
    queryData: QueryBlogsDTO,
    currentUserId: string,
  ): Promise<Result<Paginated<BloggerBlogInfoDTO[]>>> {
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
    const paginatedBlogs = await Paginated.getPaginated<BloggerBlogInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: allBlogs.map(
        (b) =>
          new BloggerBlogInfoDTO(
            b._id.toString(),
            b.name,
            b.description,
            b.websiteUrl,
            b.createdAt,
            b.isMembership,
          ),
      ),
    });
    return new Result<Paginated<BloggerBlogInfoDTO[]>>(
      ResultCode.Success,
      paginatedBlogs,
      null,
    );
  }
}
