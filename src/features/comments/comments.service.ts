import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Types } from 'mongoose';
import { CommentInfoDTO, InputCommentDTO } from './applications/comments.dto';
import { tryObjectId } from '../../app.service';
import { CommentLike } from './applications/comments-likes.schema';
import { Comment } from './applications/comments.schema';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async updateCommentLike(
    commentId: string,
    likeStatus: string,
    userId: string,
  ) {
    tryObjectId(commentId);
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) return false;
    const updateLike = await this.commentsRepository.updateCommentLike(
      commentId,
      likeStatus,
      userId,
    );
    if (!updateLike) return false;
    return true;
  }

  async setCommentLike(commentId: string, likeStatus: string, userId: string) {
    tryObjectId(commentId);
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) return false;
    const commentLike = {
      _id: new Types.ObjectId(),
      userId: userId,
      commentId: commentId,
      status: likeStatus,
    };
    await this.commentsRepository.setCommentLike(commentLike);
    return true;
  }

  async updateComment(id: string, inputData: InputCommentDTO, userId: string) {
    tryObjectId(id);
    const findComment = await this.commentsRepository.findCommentById(id);
    if (!findComment) return false;
    if (findComment.userId !== userId) throw new ForbiddenException();
    return this.commentsRepository.updateComment(id, inputData);
  }

  async deleteComment(id: string, userId: string) {
    tryObjectId(id);
    const findComment = await this.commentsRepository.findCommentById(id);
    if (!findComment) return false;
    if (findComment.userId !== userId) throw new ForbiddenException();
    return this.commentsRepository.deleteComment(id);
  }

  async findCommentById(id: string, userId?: string) {
    tryObjectId(id);
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) return false;
    const likesCount = await this.commentsRepository.countLikeStatusInfo(
      id,
      'Like',
    );
    const dislikesCount = await this.commentsRepository.countLikeStatusInfo(
      id,
      'Dislike',
    );
    let likeInfo;
    if (userId) {
      likeInfo =
        await this.commentsRepository.findCommentLikeByCommentAndUserId(
          id,
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
