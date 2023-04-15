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

@Module({
  imports: [
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
  controllers: [
    AppController,
    TestingController,
    UsersController,
    PostsController,
    BlogsController,
    CommentsController,
    AuthController,
    DevicesController,
  ],
  providers: [
    //{ provide: APP_GUARD, useClass: ThrottlerGuard },
    BlogExistsRule,
    EmailAdapter,
    AuthService,
    AppService,
    UsersService,
    UsersRepository,
    PostsService,
    PostsRepository,
    DevicesRepository,
    DevicesService,
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
