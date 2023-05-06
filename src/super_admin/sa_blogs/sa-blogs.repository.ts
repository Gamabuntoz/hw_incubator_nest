import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Blog,
  BlogDocument,
} from '../../blogger/blogger_blogs/applications/blogger-blogs.schema';
import { QueryBlogsDTO } from '../../features/blogs/applications/blogs.dto';

@Injectable()
export class SABlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async findBlogById(id: Types.ObjectId) {
    return this.blogModel.findOne({
      _id: id,
    });
  }

  async findAllBlogs(filter: any, sort: string, queryData: QueryBlogsDTO) {
    return this.blogModel
      .find(filter)
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }

  async totalCountBlogs(filter: any) {
    return this.blogModel.countDocuments(filter);
  }

  async bindBlogWithUser(
    blogId: Types.ObjectId,
    userId: Types.ObjectId,
    userLogin: string,
  ) {
    const result = await this.blogModel.updateOne(
      {
        _id: blogId,
      },
      { $set: { ownerId: userId.toString(), ownerLogin: userLogin } },
    );
    return result.matchedCount === 1;
  }
}
