import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './applications/posts.schema';
import {
  AllPostsInfoDTO,
  InputPostWithIdDTO,
  PostInfoDTO,
  QueryPostsDTO,
} from './applications/posts.dto';
import { PostLike, PostLikeDocument } from './applications/posts-likes.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private postLikeModel: Model<PostLikeDocument>,
  ) {}

  async findAllPosts(queryData: QueryPostsDTO) {
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    const totalCount = await this.postModel.countDocuments({});
    return this.postModel
      .find({})
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }

  async totalCountPost() {
    return this.postModel.countDocuments({});
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

  async updatePost(id: string, inputPostData: InputPostWithIdDTO) {
    const postInstance = await this.postModel.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!postInstance) return false;
    postInstance.title = inputPostData.title;
    postInstance.shortDescription = inputPostData.shortDescription;
    postInstance.content = inputPostData.content;
    postInstance.blogId = inputPostData.blogId;
    await postInstance.save();
    return true;
  }

  async deletePost(id: string) {
    const result = await this.postModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    return result.deletedCount === 1;
  }

  async countLikeStatusInfo(postId: string, status: string) {
    return this.postLikeModel.countDocuments({
      postId: postId,
      status: status,
    });
  }

  async updatePostLike(postId: string, likeStatus: string, userId: string) {
    const result = await this.postModel.updateOne(
      { postId: postId, userId: userId },
      { $set: { status: likeStatus } },
    );
    return result.matchedCount === 1;
  }

  async setPostLike(newPostlike: PostLike) {
    await this.postModel.create(newPostlike);
    return newPostlike;
  }

  async findLastPostLikes(postId: string) {
    return this.postLikeModel
      .find({ postId: postId, status: 'Like' })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
  }

  async findPostLikeByPostAndUserId(postId: string, userId: string) {
    return this.postLikeModel.findOne({
      postId: postId.toString(),
      userId: userId,
    });
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
