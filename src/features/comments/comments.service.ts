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
    let likeStatusCurrentUser;
    if (userId) {
      likeStatusCurrentUser =
        await this.commentsRepository.findCommentLikeByCommentAndUserId(
          id.toString(),
          userId,
        );
    }
    return this.createCommentViewInfo(comment, likeStatusCurrentUser);
  }

  async createCommentViewInfo(
    comment: Comment,
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
        dislikesCount: comment.dislikeCount,
        likesCount: comment.likeCount,
        myStatus: likeStatusCurrentUser ? likeStatusCurrentUser.status : 'None',
      },
    );
  }
}
