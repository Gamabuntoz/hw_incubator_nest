import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './applications/comments.schema';
import { QueryPostsDTO } from '../posts/applications/posts.dto';
import {
  AllCommentsInfoDTO,
  CommentInfoDTO,
  InputCommentDTO,
} from './applications/comments.dto';
import {
  CommentLike,
  CommentLikeDocument,
} from './applications/comments-likes.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async findCommentById(id: string) {
    return this.commentModel.findOne({ _id: new Types.ObjectId(id) });
  }

  async createComment(newComment: Comment) {
    const commentInstance = new this.commentModel(newComment);
    commentInstance._id = newComment._id;
    commentInstance.postId = newComment.postId;
    commentInstance.content = newComment.content;
    commentInstance.userId = newComment.userId;
    commentInstance.userLogin = newComment.userLogin;
    commentInstance.createdAt = newComment.createdAt;
    await commentInstance.save();
    return newComment;
  }

  async updateCommentLike(
    commentId: string,
    likeStatus: string,
    userId: string,
  ) {
    const result = await this.commentLikeModel.updateOne(
      { commentId: commentId, userId: userId },
      { $set: { status: likeStatus } },
    );
    return result.matchedCount === 1;
  }

  async setCommentLike(newCommentLike: CommentLike) {
    await this.commentLikeModel.create(newCommentLike);
    return newCommentLike;
  }

  async countLikeStatusInfo(commentId: string, status: string) {
    return this.commentLikeModel.countDocuments({
      commentId: commentId,
      status: status,
    });
  }

  async updateComment(id: string, inputData: InputCommentDTO) {
    const commentInstance = await this.commentModel.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!commentInstance) return false;
    commentInstance.content = inputData.content;
    await commentInstance.save();
    return true;
  }

  async deleteComment(id: string) {
    const result = await this.commentModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    return result.deletedCount === 1;
  }

  async findAllCommentsByPostId(id: string, queryData: QueryPostsDTO) {
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    return this.commentModel
      .find({ postId: id })
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }

  async findCommentLikeByCommentAndUserId(commentId: string, userId: string) {
    return this.commentLikeModel.findOne({
      commentId: commentId,
      userId: userId,
    });
  }

  async countLikeCommentStatusInfo(commentId: string, status: string) {
    return this.commentLikeModel.countDocuments({
      postId: commentId,
      status: status,
    });
  }

  async totalCountComments(filter?: string) {
    return this.commentModel.countDocuments({ filter });
  }
}
