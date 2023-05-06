import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
} from '../super_admin/sa_users/applications/users.schema';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../public/posts/applications/posts.schema';
import {
  Comment,
  CommentDocument,
} from '../public/comments/applications/comments.schema';
import {
  Device,
  DeviceDocument,
} from '../public/devices/applications/devices.schema';
import {
  PostLike,
  PostLikeDocument,
} from '../public/posts/applications/posts-likes.schema';
import {
  CommentLike,
  CommentLikeDocument,
} from '../public/comments/applications/comments-likes.schema';
import {
  Blog,
  BlogDocument,
} from '../blogger/blogger_blogs/applications/blogger-blogs.schema';
@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(PostLike.name) private postLikeModel: Model<PostLikeDocument>,
    @InjectModel(CommentLike.name)
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all-data')
  async deleteAllData() {
    {
    }
    await this.userModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.blogModel.deleteMany({});
    await this.deviceModel.deleteMany({});
    await this.postLikeModel.deleteMany({});
    await this.commentLikeModel.deleteMany({});
    return;
  }
}
