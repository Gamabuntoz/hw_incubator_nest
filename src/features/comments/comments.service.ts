import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Types } from 'mongoose';
import { CommentInfoDTO } from './applications/comments.dto';
import { CommentLike } from './applications/comments-likes.schema';
import { Comment } from './applications/comments.schema';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async findCommentById(id: Types.ObjectId, userId?: string) {
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) return false;
    const likesCount = await this.commentsRepository.countLikeStatusInfo(
      id.toString(),
      'Like',
    );
    const dislikesCount = await this.commentsRepository.countLikeStatusInfo(
      id.toString(),
      'Dislike',
    );
    let likeInfo;
    if (userId) {
      likeInfo =
        await this.commentsRepository.findCommentLikeByCommentAndUserId(
          id.toString(),
          userId,
        );
    }
    return this.createCommentViewInfo(
      comment,
      likesCount,
      dislikesCount,
      likeInfo,
    );
  }

  async createCommentViewInfo(
    comment: Comment,
    likesInfo: number,
    dislikesInfo: number,
    likeStatusCurrentUser?: CommentLike,
  ) {
    return new CommentInfoDTO(
      comment._id.toString(),
      comment.content,
      {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      comment.createdAt,
      {
        dislikesCount: dislikesInfo,
        likesCount: likesInfo,
        myStatus: likeStatusCurrentUser ? likeStatusCurrentUser.status : 'None',
      },
    );
  }
}
