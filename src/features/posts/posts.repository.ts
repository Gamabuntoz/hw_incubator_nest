import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './posts.schema';
import {
  AllPostsInfoDTO,
  InputPostWithIdDTO,
  PostInfoDTO,
  QueryPostsDTO,
} from './posts.dto';
import { BlogInfoDTO } from '../blogs/blogs.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getCommentsByPostId(newUser: User) {
    return newUser;
  }

  async getAllPosts(newUser: User) {
    return newUser;
  }

  async createPost(newPost: Post) {
    const postInstance = new this.postModel(newPost);
    postInstance._id = newPost._id;
    postInstance.title = newPost.title;
    postInstance.shortDescription = newPost.shortDescription;
    postInstance.content = newPost.content;
    postInstance.blogId = newPost.blogId;
    postInstance.blogName = newPost.blogName;
    postInstance.createdAt = newPost.createdAt;
    await postInstance.save();
    return newPost;
  }

  async findPostById(id: string) {
    return this.postModel.findOne({ _id: new Types.ObjectId(id) });
  }

  async updatePost(newUser: User) {
    return newUser;
  }

  async deletePost(id: string) {
    const result = await this.postModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    return result.deletedCount === 1;
  }

  async findAllPostsByBlogId(id: string, queryData: QueryPostsDTO) {
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.postModel.countDocuments({ blogId: id });
    const findAll = await this.postModel
      .find({ blogId: id })
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();

    return new AllPostsInfoDTO(
      Math.ceil(totalCount / queryData.pageSize),
      queryData.pageNumber,
      queryData.pageSize,
      totalCount,
      findAll.map(
        (p) =>
          new PostInfoDTO(
            p._id.toString(),
            p.title,
            p.shortDescription,
            p.content,
            p.blogId,
            p.blogName,
            p.createdAt,
            {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          ),
      ),
    );
  }
}
