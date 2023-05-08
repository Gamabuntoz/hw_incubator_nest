import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './applications/comments.schema';
import { QueryPostsDTO } from '../posts/applications/posts.dto';
import { InputCommentDTO } from './applications/comments.dto';
import {
  CommentLike,
  CommentLikeDocument,
} from './applications/comments-likes.schema';
import { QueryCommentsDTO } from '../../blogger/blogger_blogs/applications/blogger-blogs.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async findCommentById(id: Types.ObjectId) {
    return this.commentModel.findOne({ _id: id });
  }

  async findAllCommentLikes(id: Types.ObjectId, status: string) {
    return this.commentLikeModel.find({
      commentId: id.toString(),
      status: status,
    });
  }

  async createComment(newComment: Comment) {
    await this.commentModel.create(newComment);
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
    await this.changeCountCommentLike(commentId);
    return result.matchedCount === 1;
  }

  async setCommentLike(newCommentLike: CommentLike) {
    await this.commentLikeModel.create(newCommentLike);
    await this.changeCountCommentLike(newCommentLike.commentId);
    return newCommentLike;
  }

  async countLikeCommentStatusInfo(commentId: string, status: string) {
    return this.commentLikeModel.countDocuments({
      commentId: commentId,
      status: status,
    });
  }

  async changeCountCommentLike(commentId: string) {
    const likeCount = await this.countLikeCommentStatusInfo(commentId, 'Like');
    const dislikeCount = await this.countLikeCommentStatusInfo(
      commentId,
      'Dislike',
    );
    await this.commentModel.updateOne(
      { _id: new Types.ObjectId(commentId) },
      { $set: { likeCount, dislikeCount } },
    );
    return;
  }

  async updateComment(id: Types.ObjectId, inputData: InputCommentDTO) {
    const result = await this.commentModel.updateOne(
      {
        _id: new Types.ObjectId(id),
      },
      { $set: { content: inputData.content } },
    );
    return result.matchedCount === 1;
  }

  async deleteComment(id: Types.ObjectId) {
    const result = await this.commentModel.deleteOne({
      _id: id,
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

  async findAllCommentsByPostIds(
    postsIds: string[],
    queryData: QueryCommentsDTO,
  ) {
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    return this.commentModel
      .find({ postId: { $in: postsIds } })
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

  async totalCountComments(id: string) {
    return this.commentModel.countDocuments({ postId: id });
  }

  async totalCountCommentsByPostsIds(postsIds: string[]) {
    return this.commentModel.countDocuments({ postId: { $in: postsIds } });
  }
}