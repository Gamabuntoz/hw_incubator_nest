import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/applications/users.schema';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/applications/posts.schema';
import {
  Comment,
  CommentDocument,
} from '../comments/applications/comments.schema';
import { Blog, BlogDocument } from '../blogs/applications/blogs.schema';
@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
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
    return;
  }
}
