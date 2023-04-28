import { HttpStatus, Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import {
  AllPostsInfoDTO,
  PostInfoDTO,
  QueryPostsDTO,
} from './applications/posts.dto';
import { Types } from 'mongoose';
import { CommentsRepository } from '../comments/comments.repository';
import { UsersRepository } from '../users/users.repository';
import {
  CommentInfoDTO,
  Paginated,
  Result,
  ResultCode,
} from '../comments/applications/comments.dto';
import { Post } from './applications/posts.schema';
import { PostLike } from './applications/posts-likes.schema';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
    protected commentsService: CommentsService,
  ) {}

  async findCommentsByPostId(
    id: Types.ObjectId,
    queryData: QueryPostsDTO,
    userId?: string,
  ): Promise<Result<Paginated<CommentInfoDTO[]>>> {
    const postById = await this.postsRepository.findPostById(id);
    if (!postById)
      return new Result<Paginated<CommentInfoDTO[]>>(
        ResultCode.NotFound,
        null,
        'Post not found',
      );
    const totalCount = await this.commentsRepository.totalCountComments(
      id.toString(),
    );
    const allComments = await this.commentsRepository.findAllCommentsByPostId(
      id.toString(),
      queryData,
    );
    const paginatedComments = await Paginated.getPaginated<CommentInfoDTO[]>({
      totalCount,
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      items: await Promise.all(
        allComments.map(async (c) => {
          let likeStatusCurrentUser;
          if (userId) {
            likeStatusCurrentUser =
              await this.commentsRepository.findCommentLikeByCommentAndUserId(
                c._id.toString(),
                userId,
              );
          }
          return this.commentsService.createCommentViewInfo(
            c,
            likeStatusCurrentUser,
          );
        }),
      ),
    });

    return new Result<Paginated<CommentInfoDTO[]>>(
      HttpStatus.OK,
      paginatedComments,
      null,
    );
  }

  async findAllPosts(term: QueryPostsDTO, userId?: string) {
    const queryData = new QueryPostsDTO(
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
    );
    const totalCount = await this.postsRepository.totalCountPosts();
    const allPosts = await this.postsRepository.findAllPosts(queryData);
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
          return this.createPostViewInfo(
            p,
            lastPostLikes,
            likeStatusCurrentUser,
          );
        }),
      ),
    );
  }

  async findPostById(id: Types.ObjectId, userId?: string) {
    const postById = await this.postsRepository.findPostById(id);
    if (!postById) return false;
    let likeStatusCurrentUser;
    if (userId) {
      likeStatusCurrentUser =
        await this.postsRepository.findPostLikeByPostAndUserId(
          id.toString(),
          userId,
        );
    }
    const lastPostLikes = await this.postsRepository.findLastPostLikes(
      id.toString(),
    );
    return this.createPostViewInfo(
      postById,
      lastPostLikes,
      likeStatusCurrentUser,
    );
  }

  async createPostViewInfo(
    post: Post,
    lastPostLikes: PostLike[],
    likeStatusCurrentUser?: PostLike,
  ) {
    return new PostInfoDTO(
      post._id.toString(),
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      {
        likesCount: post.likeCount,
        dislikesCount: post.dislikeCount,
        myStatus: likeStatusCurrentUser ? likeStatusCurrentUser.status : 'None',
        newestLikes: await Promise.all(
          lastPostLikes.map(async (l) => {
            const user = await this.usersRepository.findUserById(l.userId);
            return {
              addedAt: l.addedAt.toISOString(),
              userId: l.userId,
              login: user?.accountData.login,
            };
          }),
        ),
      },
    );
  }
}
