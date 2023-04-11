import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './features/testing/testing.controller';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { UsersModule } from './features/users/applications/users.module';
import { PostsModule } from './features/posts/applications/posts.module';
import { CommentsModule } from './features/comments/applications/comments.module';
import { BlogsModule } from './features/blogs/applications/blogs.module';
import { User, UserSchema } from './features/users/applications/users.schema';
import { Post, PostSchema } from './features/posts/applications/posts.schema';
import { Blog, BlogSchema } from './features/blogs/applications/blogs.schema';
import {
  Comment,
  CommentSchema,
} from './features/comments/applications/comments.schema';
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
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './features/auth/applications/constants';
import { LocalStrategy } from './features/auth/strategies/local.strategy';
import { JwtAccessStrategy } from './features/auth/strategies/jwt-access.strategy';
import { BasicStrategy } from './features/auth/strategies/basic.strategy';
import {
  CommentLike,
  CommentLikeSchema,
} from './features/comments/applications/comments-likes.schema';
import {
  PostLike,
  PostLikeSchema,
} from './features/posts/applications/posts-likes.schema';
import { OptionalJwtAuthGuard } from './features/auth/guards/optionalJwtAuth.guard';

@Module({
  imports: [
    // UsersModule,
    // BlogsModule,
    // PostsModule,
    // CommentsModule,
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secretAccessKey,
      signOptions: { expiresIn: '5m' },
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema },
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
    LocalStrategy,
    JwtAccessStrategy,
    BasicStrategy,
    OptionalJwtAuthGuard,
  ],
})
export class AppModule {}
