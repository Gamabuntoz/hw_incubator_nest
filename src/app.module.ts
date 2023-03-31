import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './features/testing/testing.controller';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { UsersModule } from './features/users/users.module';
import { PostsModule } from './features/posts/posts.module';
import { CommentsModule } from './features/comments/comments.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { User, UserSchema } from './features/users/users.schema';
import { Post, PostSchema } from './features/posts/posts.schema';
import { Blog, BlogSchema } from './features/blogs/blogs.schema';
import { Comment, CommentSchema } from './features/comments/comments.schema';
import { UsersController } from './features/users/users.controller';
import { PostsController } from './features/posts/posts.controller';
import { BlogsController } from './features/blogs/blogs.controller';
import { CommentsController } from './features/comments/comments.controller';
import { UsersService } from './features/users/users.service';
import { UsersRepository } from './features/users/users.repository';
import { PostsService } from './features/posts/posts.service';
import { PostsRepository } from './features/posts/posts.repository';
import { BlogsService } from './features/blogs/blogs.service';
import { BlogsRepository } from './features/blogs/blogs.repository';
import { CommentsService } from './features/comments/comments.service';
import { CommentsRepository } from './features/comments/comments.repository';

@Module({
  imports: [
    // UsersModule,
    // BlogsModule,
    // PostsModule,
    // CommentsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [
    AppController,
    TestingController,
    UsersController,
    PostsController,
    BlogsController,
    CommentsController,
  ],
  providers: [
    AppService,
    UsersService,
    UsersRepository,
    PostsService,
    PostsRepository,
    BlogsService,
    BlogsRepository,
    CommentsService,
    CommentsRepository,
  ],
})
export class AppModule {}
