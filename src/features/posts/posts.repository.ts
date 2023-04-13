import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './applications/posts.schema';
import { InputPostWithIdDTO, QueryPostsDTO } from './applications/posts.dto';
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
    return this.postModel
      .find({})
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }

  async findAllPostsByBlogId(id: string, queryData: QueryPostsDTO) {
    let sort = 'createdAt';
    if (queryData.sortBy) {
      sort = queryData.sortBy;
    }
    return this.postModel
      .find({ blogId: id })
      .sort({ [sort]: queryData.sortDirection === 'asc' ? 1 : -1 })
      .skip((queryData.pageNumber - 1) * queryData.pageSize)
      .limit(queryData.pageSize)
      .lean();
  }

  async totalCountPosts() {
    return this.postModel.countDocuments({});
  }

  async totalCountPostsByBlogId(blogId: string) {
    return this.postModel.countDocuments({ blogId: blogId });
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

  async countLikePostStatusInfo(postId: string, status: string) {
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

  async setPostLike(newPostLike: PostLike) {
    await this.postLikeModel.create(newPostLike);
    return newPostLike;
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
}
