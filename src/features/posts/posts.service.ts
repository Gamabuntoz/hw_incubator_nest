import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostInfoDTO, QueryPostsDTO } from './applications/posts.dto';
import { Types } from 'mongoose';
import { CommentsRepository } from '../comments/comments.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentInfoDTO } from '../comments/applications/comments.dto';
import { Post } from './applications/posts.schema';
import { PostLike } from './applications/posts-likes.schema';
import { CommentsService } from '../comments/comments.service';
import { Paginated } from '../../helpers/paginated';
import { Result, ResultCode } from '../../helpers/contract';

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
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
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
      ResultCode.Success,
      paginatedComments,
      null,
    );
  }

  async findAllPosts(
    queryData: QueryPostsDTO,
    userId?: string,
  ): Promise<Result<Paginated<PostInfoDTO[]>>> {
    const totalCount = await this.postsRepository.totalCountPosts();
    const allPosts = await this.postsRepository.findAllPosts(queryData);
    const paginatedPosts = await Paginated.getPaginated<PostInfoDTO[]>({
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      totalCount,
      items: await Promise.all(
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
    });
    return new Result<Paginated<PostInfoDTO[]>>(
      ResultCode.Success,
      paginatedPosts,
      null,
    );
  }

  async findPostById(
    id: Types.ObjectId,
    userId?: string,
  ): Promise<Result<PostInfoDTO>> {
    const postById = await this.postsRepository.findPostById(id);
    if (!postById)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'post not found',
      );
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
    const postView = await this.createPostViewInfo(
      postById,
      lastPostLikes,
      likeStatusCurrentUser,
    );
    return new Result<PostInfoDTO>(ResultCode.Success, postView, null);
  }

  async createPostViewInfo(
    post: Post,
    lastPostLikes: PostLike[],
    likeStatusCurrentUser?: PostLike,
  ): Promise<PostInfoDTO> {
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
