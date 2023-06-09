import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from './applications/blogs.schema';
import { InputBlogDTO, QueryBlogsDTO } from './applications/blogs.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

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

  async findBlogById(id: Types.ObjectId) {
    return this.blogModel.findOne({
      _id: id,
    });
  }

  async createBlog(newBlog: Blog) {
    await this.blogModel.create(newBlog);
    return newBlog;
  }

  async updateBlog(id: Types.ObjectId, inputBlogData: InputBlogDTO) {
    await this.blogModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          name: inputBlogData.name,
          description: inputBlogData.description,
          websiteUrl: inputBlogData.websiteUrl,
        },
      },
    );
    return true;
  }

  async deleteBlog(id: Types.ObjectId) {
    await this.blogModel.deleteOne({
      _id: id,
    });
    return true;
  }
}
