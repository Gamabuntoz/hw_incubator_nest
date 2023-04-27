import { HttpStatus, Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import {
  AllPostsInfoDTO,
  InputPostWithIdDTO,
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
        HttpStatus.NOT_FOUND,
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
          let likeInfo;
          if (userId) {
            likeInfo =
              await this.commentsRepository.findCommentLikeByCommentAndUserId(
                c._id.toString(),
                userId,
              );
          }
          const likesCount =
            await this.commentsRepository.countLikeCommentStatusInfo(
              c._id.toString(),
              'Like',
            );
          const dislikesCount =
            await this.commentsRepository.countLikeCommentStatusInfo(
              c._id.toString(),
              'Dislike',
            );
          return this.commentsService.createCommentViewInfo(
            c,
            likesCount,
            dislikesCount,
            likeInfo,
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
          let likeInfo;
          if (userId) {
            likeInfo = await this.postsRepository.findPostLikeByPostAndUserId(
              p._id.toString(),
              userId,
            );
          }
          const likesInfo = await this.postsRepository.countLikePostStatusInfo(
            p._id.toString(),
            'Like',
          );
          const dislikesInfo =
            await this.postsRepository.countLikePostStatusInfo(
              p._id.toString(),
              'Dislike',
            );
          const lastPostLikes = await this.postsRepository.findLastPostLikes(
            p._id.toString(),
          );
          return this.createPostViewInfo(
            p,
            lastPostLikes,
            likesInfo,
            dislikesInfo,
            likeInfo,
          );
        }),
      ),
    );
  }

  async findPostById(id: Types.ObjectId, userId?: string) {
    const postById = await this.postsRepository.findPostById(id);
    if (!postById) return false;
    const likesInfo = await this.postsRepository.countLikePostStatusInfo(
      id.toString(),
      'Like',
    );
    const dislikesInfo = await this.postsRepository.countLikePostStatusInfo(
      id.toString(),
      'Dislike',
    );
    let likeInfo;
    if (userId) {
      likeInfo = await this.postsRepository.findPostLikeByPostAndUserId(
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
      likesInfo,
      dislikesInfo,
      likeInfo,
    );
  }

  async updatePostLike(
    postId: Types.ObjectId,
    likeStatus: string,
    userId: string,
  ) {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) return false;
    const updateLike = await this.postsRepository.updatePostLike(
      postId.toString(),
      likeStatus,
      userId,
    );
    if (!updateLike) return false;
    return true;
  }

  async setPostLike(
    postId: Types.ObjectId,
    likeStatus: string,
    userId: string,
  ) {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) return false;
    const postLike: PostLike = {
      _id: new Types.ObjectId(),
      userId: userId,
      postId: postId.toString(),
      status: likeStatus,
      addedAt: new Date(),
    };
    await this.postsRepository.setPostLike(postLike);
    return true;
  }

  async createCommentByPostId(
    postId: Types.ObjectId,
    content: string,
    userId: string,
  ) {
    const user = await this.usersRepository.findUserById(userId);
    const postById = await this.postsRepository.findPostById(postId);
    if (!postById) return false;
    const newComment = {
      _id: new Types.ObjectId(),
      postId: postId.toString(),
      content: content,
      userId: userId,
      userLogin: user.accountData.login,
      createdAt: new Date().toISOString(),
    };
    await this.commentsRepository.createComment(newComment);
    return new CommentInfoDTO(
      newComment._id.toString(),
      newComment.content,
      {
        userId: newComment.userId,
        userLogin: newComment.userLogin,
      },
      newComment.createdAt,
      {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
      },
    );
  }

  async updatePost(id: Types.ObjectId, inputPostData: InputPostWithIdDTO) {
    return this.postsRepository.updatePost(id, inputPostData);
  }

  async deletePost(id: Types.ObjectId) {
    return this.postsRepository.deletePost(id);
  }

  async createPostViewInfo(
    post: Post,
    lastPostLikes: PostLike[],
    likesInfo: number,
    dislikesInfo: number,
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
        likesCount: likesInfo,
        dislikesCount: dislikesInfo,
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
