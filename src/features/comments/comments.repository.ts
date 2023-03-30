import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './comments.schema';
import { QueryPostsDTO } from '../posts/posts.dto';
import { AllCommentsInfoDTO, CommentInfoDTO } from './comments.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async findCommentById(id: string) {
    return this.commentModel.findOne({ _id: new Types.ObjectId(id) });
  }

  async findAllCommentsByPostId(id: string, queryData: QueryPostsDTO) {
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.commentModel.countDocuments({ postId: id });
    const findAll = await this.commentModel
      .find({ postId: id })
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();

    return new AllCommentsInfoDTO(
      Math.ceil(totalCount / queryData.pageSize),
      queryData.pageNumber,
      queryData.pageSize,
      totalCount,
      findAll.map(
        (c) =>
          new CommentInfoDTO(
            c._id.toString(),
            c.content,
            {
              userId: c.userId,
              userLogin: c.userLogin,
            },
            c.createdAt,
            {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          ),
      ),
    );
  }
}
