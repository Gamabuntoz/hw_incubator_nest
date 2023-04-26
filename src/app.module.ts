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
import { OptionalJwtAuthGuard } from './features/auth/guards/optional-jwt-auth.guard';
import { EmailAdapter } from './adapters/email.adapters';
import { AuthController } from './features/auth/auth.controller';
import { AuthService } from './features/auth/auth.service';
import {
  Device,
  DeviceSchema,
} from './features/devices/applications/devices.schema';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DevicesRepository } from './features/devices/devices.repository';
import { DevicesController } from './features/devices/devices.controller';
import { DevicesService } from './features/devices/devices.service';
import { BlogExistsRule } from './features/auth/applications/validate-blog-id.param.decorator';
import { APP_GUARD } from '@nestjs/core';
import { LoginOrEmailExistRule } from './features/auth/applications/validate-email-and-login.param.decorator';
import { BlogsService } from './features/blogs/blogs.service';
import { CreatePostWithBlogIdUseCases } from './features/blogs/use-cases/create-post-whith-blog-id-use-cases';
import { CreateBlogUseCases } from './features/blogs/use-cases/create-blog-use-cases';
import { DeleteBlogUseCases } from './features/blogs/use-cases/delete-blog-use-cases';
import { UpdateBlogUseCases } from './features/blogs/use-cases/update-blog-use-cases';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateCommentUseCases } from './features/comments/use-cases/update-comment-use-cases';
import { UpdateCommentLikeStatusUseCases } from './features/comments/use-cases/update-comment-like-status-use-cases';
import { DeleteCommentUseCases } from './features/comments/use-cases/delete-comment-use-cases';

const useCases = [
  CreatePostWithBlogIdUseCases,
  CreateBlogUseCases,
  DeleteBlogUseCases,
  UpdateBlogUseCases,
  UpdateCommentUseCases,
  UpdateCommentLikeStatusUseCases,
  DeleteCommentUseCases,
];
const strategies = [
  LocalStrategy,
  JwtAccessStrategy,
  BasicStrategy,
  OptionalJwtAuthGuard,
];
const decorators = [
  BlogExistsRule,
  //LoginOrEmailExistRule
];
const repositories = [
  UsersRepository,
  PostsRepository,
  DevicesRepository,
  BlogsRepository,
  CommentsRepository,
];
const services = [
  AuthService,
  AppService,
  UsersService,
  PostsService,
  DevicesService,
  BlogsService,
  CommentsService,
];
const adapters = [EmailAdapter];
const controllers = [
  AppController,
  TestingController,
  UsersController,
  PostsController,
  BlogsController,
  CommentsController,
  AuthController,
  DevicesController,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secretKey,
      signOptions: { expiresIn: '5m' },
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...repositories,
    ...useCases,
    ...strategies,
    ...decorators,
    ...adapters,
  ],
})
export class AppModule {}
