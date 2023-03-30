import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './features/users/users.controller';
import { UsersService } from './features/users/users.service';
import { UsersRepository } from './features/users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './features/users/users.schema';
import { TestingController } from './features/testing/testing.controller';
import { CommentsController } from './features/comments/comments.controller';
import { PostsController } from './features/posts/posts.controller';
import { BlogsController } from './features/blogs/blogs.controller';
import { CommentsService } from './features/comments/comments.service';
import { CommentsRepository } from './features/comments/comments.repository';
import { BlogsService } from './features/blogs/blogs.service';
import { BlogsRepository } from './features/blogs/blogs.repository';
import { PostsService } from './features/posts/posts.service';
import { PostsRepository } from './features/posts/posts.repository';
import { Comment, CommentSchema } from './features/comments/comments.schema';
import { Post, PostSchema } from './features/posts/posts.schema';
import { Blog, BlogSchema } from './features/blogs/blogs.schema';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
  ],
  controllers: [
    AppController,
    UsersController,
    TestingController,
    CommentsController,
    PostsController,
    BlogsController,
  ],
  providers: [
    AppService,
    UsersService,
    UsersRepository,
    CommentsService,
    CommentsRepository,
    BlogsService,
    BlogsRepository,
    PostsService,
    PostsRepository,
  ],
})
export class AppModule {}
