import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Types } from 'mongoose';
import { InputCommentDTO } from './applications/comments.dto';
import { tryObjectId } from '../../app.service';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async updateCommentLike(
    commentId: string,
    likeStatus: string,
    userId: string,
  ) {
    tryObjectId(commentId);
    const updateLike = await this.commentsRepository.updateCommentLike(
      likeStatus,
      commentId,
      userId,
    );
    if (!updateLike) return false;
    return true;
  }

  async setCommentLike(commentId: string, likeStatus: string, userId: string) {
    tryObjectId(commentId);
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
    if (findComment.userId !== userId) throw new ForbiddenException();
    return this.commentsRepository.updateComment(id, inputData);
  }

  async deleteComment(id: string, userId: string) {
    tryObjectId(id);
    const findComment = await this.commentsRepository.findCommentById(id);
    if (findComment.userId !== userId) throw new ForbiddenException();
    return this.commentsRepository.deleteComment(id);
  }

  async findCommentById(id: string) {
    tryObjectId(id);
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) return false;
    const likesInfo = await this.commentsRepository.countLikeStatusInfo(
      id,
      'Like',
    );
    const dislikesInfo = await this.commentsRepository.countLikeStatusInfo(
      id,
      'Dislike',
    );
  }
}
