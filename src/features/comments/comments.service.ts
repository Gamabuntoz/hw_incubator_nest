import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Types } from 'mongoose';
import { CommentInfoDTO } from './applications/comments.dto';
import { CommentLike } from './applications/comments-likes.schema';
import { Comment } from './applications/comments.schema';
import { Result, ResultCode } from 'src/helpers/contract';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async findCommentById(
    id: Types.ObjectId,
    userId?: string,
  ): Promise<Result<CommentInfoDTO>> {
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment)
      return new Result<CommentInfoDTO>(
        ResultCode.NotFound,
        null,
        'Comment not found',
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
    );
    return new Result<CommentInfoDTO>(ResultCode.Success, commentView, null);
  }

  async createCommentViewInfo(
    comment: Comment,
    likeStatusCurrentUser?: CommentLike,
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
        dislikesCount: comment.dislikeCount,
        likesCount: comment.likeCount,
        myStatus: likeStatusCurrentUser ? likeStatusCurrentUser.status : 'None',
      },
    );
  }
}
