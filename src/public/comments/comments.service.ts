import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Types } from 'mongoose';
import { CommentInfoDTO } from './applications/comments.dto';
import { CommentLike } from './applications/comments-likes.schema';
import { Comment } from './applications/comments.schema';
import { Result, ResultCode } from '../../helpers/contract';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async findCommentById(
    id: Types.ObjectId,
    userId?: string,
  ): Promise<Result<CommentInfoDTO>> {
    const comment: Comment = await this.commentsRepository.findCommentById(id);
    if (!comment)
      return new Result<CommentInfoDTO>(
        ResultCode.NotFound,
        null,
        'Comment not found',
      );
    const userComment = await this.usersRepository.findUserById(comment.userId);
    if (userComment.banInformation.isBanned)
      return new Result<CommentInfoDTO>(
        ResultCode.NotFound,
        null,
        'Comment owner is banned',
      );

    const countBannedLikesOwner = await this.countBannedStatusOwner(id, 'Like');
    const countBannedDislikesOwner = await this.countBannedStatusOwner(
      id,
      'Dislike',
    );

    let likeStatusCurrentUser;
    if (userId) {
      likeStatusCurrentUser =
        await this.commentsRepository.findCommentLikeByCommentAndUserId(
          id.toString(),
          userId,
        );
    }
    const commentView = await this.createCommentViewInfo(
      comment,
      likeStatusCurrentUser,
      countBannedLikesOwner,
      countBannedDislikesOwner,
    );
    return new Result<CommentInfoDTO>(ResultCode.Success, commentView, null);
  }
  async countBannedStatusOwner(id: Types.ObjectId, status: string) {
    const allLikes: CommentLike[] =
      await this.commentsRepository.findAllCommentLikes(id, status);
    const allUsersLikeOwner = allLikes.map((c) => new Types.ObjectId(c.userId));
    return this.usersRepository.countBannedUsersInIdArray(allUsersLikeOwner);
  }

  async createCommentViewInfo(
    comment: Comment,
    likeStatusCurrentUser?: CommentLike,
    countBannedLikesOwner?: number,
    countBannedDislikesOwner?: number,
  ): Promise<CommentInfoDTO> {
    return new CommentInfoDTO(
      comment._id.toString(),
      comment.content,
      {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      comment.createdAt,
      {
        dislikesCount: countBannedDislikesOwner
          ? comment.dislikeCount - countBannedDislikesOwner
          : comment.dislikeCount,
        likesCount: countBannedLikesOwner
          ? comment.likeCount - countBannedLikesOwner
          : comment.likeCount,
        myStatus: likeStatusCurrentUser ? likeStatusCurrentUser.status : 'None',
      },
    );
  }
}
