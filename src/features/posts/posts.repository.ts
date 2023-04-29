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
    await this.postModel.create(newPost);
    return newPost;
  }

  async findPostById(id: Types.ObjectId) {
    return this.postModel.findOne({ _id: id });
  }

  async updatePost(id: Types.ObjectId, inputPostData: InputPostWithIdDTO) {
    const result = await this.postModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          title: inputPostData.title,
          shortDescription: inputPostData.shortDescription,
          content: inputPostData.content,
          blogId: inputPostData.blogId,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async deletePost(id: Types.ObjectId) {
    const result = await this.postModel.deleteOne({
      _id: id,
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
    const result = await this.postLikeModel.updateOne(
      { postId: postId, userId: userId },
      { $set: { status: likeStatus } },
    );
    await this.changeCountPostLike(postId);
    return result.matchedCount === 1;
  }

  async setPostLike(newPostLike: PostLike) {
    await this.postLikeModel.create(newPostLike);
    await this.changeCountPostLike(newPostLike._id.toString());
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
      postId: postId,
      userId: userId,
    });
  }

  async changeCountPostLike(postId: string) {
    const likeCount = await this.countLikePostStatusInfo(postId, 'Like');
    const dislikeCount = await this.countLikePostStatusInfo(postId, 'Dislike');
    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $set: { likeCount, dislikeCount } },
    );
    return;
  }
}
