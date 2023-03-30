import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import {
  AllBlogsInfoDTO,
  BlogInfoDTO,
  InputBlogDTO,
  QueryBlogsDTO,
} from './blogs.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async findAllBlogs(queryData: QueryBlogsDTO) {
    let filter = {};
    if (queryData.searchNameTerm) {
      filter = { name: { $regex: queryData.searchNameTerm, $options: '$i' } };
    }
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.blogModel.countDocuments(filter);
    const findAll = await this.blogModel
      .find(filter)
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();

    return new AllBlogsInfoDTO(
      Math.ceil(totalCount / queryData.pageSize),
      queryData.pageNumber,
      queryData.pageSize,
      totalCount,
      findAll.map(
        (b) =>
          new BlogInfoDTO(
            b._id.toString(),
            b.name,
            b.description,
            b.websiteUrl,
            b.createdAt,
            b.isMembership,
          ),
      ),
    );
  }

  async createBlog(newBlog: Blog) {
    const blogInstance = new this.blogModel(newBlog);
    blogInstance._id = newBlog._id;
    blogInstance.createdAt = newBlog.createdAt;
    blogInstance.name = newBlog.name;
    blogInstance.description = newBlog.description;
    blogInstance.websiteUrl = newBlog.websiteUrl;
    blogInstance.isMembership = newBlog.isMembership;
    await blogInstance.save();
    return newBlog;
  }

  async findBlogById(id: string) {
    return this.blogModel.findOne({
      _id: new Types.ObjectId(id),
    });
  }

  async updateBlog(id: string, inputBlogData: InputBlogDTO) {
    const blogInstance = await this.blogModel.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!blogInstance) return false;
    blogInstance.name = inputBlogData.name;
    blogInstance.description = inputBlogData.description;
    blogInstance.websiteUrl = inputBlogData.websiteUrl;
    await blogInstance.save();
    return true;
  }

  async deleteBlog(id: string) {
    const result = await this.blogModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    return result.deletedCount === 1;
  }
}
