import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './features/testing/testing.controller';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import {
  User,
  UserSchema,
} from './super_admin/sa_users/applications/users.schema';
import { Post, PostSchema } from './features/posts/applications/posts.schema';
import {
  Comment,
  CommentSchema,
} from './features/comments/applications/comments.schema';
import { PostsController } from './features/posts/posts.controller';
import { BlogsController } from './features/blogs/blogs.controller';
import { CommentsController } from './features/comments/comments.controller';
import { UsersRepository } from './features/users/users.repository';
import { PostsService } from './features/posts/posts.service';
import { PostsRepository } from './features/posts/posts.repository';
import { BlogsRepository } from './features/blogs/blogs.repository';
import { CommentsService } from './features/comments/comments.service';
import { CommentsRepository } from './features/comments/comments.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './helpers/constants';
import { LocalStrategy } from './security/strategies/local.strategy';
import { JwtAccessStrategy } from './security/strategies/jwt-access.strategy';
import { BasicStrategy } from './security/strategies/basic.strategy';
import {
  CommentLike,
  CommentLikeSchema,
} from './features/comments/applications/comments-likes.schema';
import {
  PostLike,
  PostLikeSchema,
} from './features/posts/applications/posts-likes.schema';
import { OptionalJwtAuthGuard } from './security/guards/optional-jwt-auth.guard';
import { EmailAdapter } from './adapters/email-adapter/email.adapter';
import { AuthController } from './features/auth/auth.controller';
import { AuthService } from './features/auth/auth.service';
import {
  Device,
  DeviceSchema,
} from './features/devices/applications/devices.schema';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevicesRepository } from './features/devices/devices.repository';
import { DevicesController } from './features/devices/devices.controller';
import { DevicesService } from './features/devices/devices.service';
import { BlogExistsRule } from './helpers/decorators/validate-blog-id.param.decorator';
import { LoginOrEmailExistRule } from './helpers/decorators/validate-email-and-login.param.decorator';
import { BlogsService } from './features/blogs/blogs.service';
import { CreatePostWithBlogIdUseCases } from './blogger/blogger_blogs/applications/use-cases/create-post-by-blog-id-use-cases';
import { CreateBlogUseCases } from './blogger/blogger_blogs/applications/use-cases/create-blog-use-cases';
import { DeleteBlogUseCases } from './blogger/blogger_blogs/applications/use-cases/delete-blog-use-cases';
import { UpdateBlogUseCases } from './blogger/blogger_blogs/applications/use-cases/update-blog-use-cases';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateCommentUseCases } from './features/comments/applications/use-cases/update-comment-use-cases';
import { UpdateCommentLikeStatusUseCases } from './features/comments/applications/use-cases/update-comment-like-status-use-cases';
import { DeleteCommentUseCases } from './features/comments/applications/use-cases/delete-comment-use-cases';
import { ConfirmEmailUseCases } from './features/auth/applications/use-cases/confirm-email-for-registration-use-cases';
import { LoginUserUseCases } from './features/auth/applications/use-cases/login-user-use-cases';
import { NewPasswordUseCases } from './features/auth/applications/use-cases/new-user-password-use-cases';
import { PasswordRecoveryUseCases } from './features/auth/applications/use-cases/recovery-user-password-use-cases';
import { RefreshTokensUseCases } from './features/auth/applications/use-cases/refresh-user-tokens-user-use-cases';
import { RegistrationUserUseCases } from './features/auth/applications/use-cases/registration-user-use-cases';
import { ResendEmailUseCases } from './features/auth/applications/use-cases/resend-email-for-registration-use-cases';
import { VerifyTokenUseCases } from './features/auth/applications/use-cases/verify-token-use-cases';
import { CreateCommentWithPostIdUseCases } from './features/comments/applications/use-cases/create-comment-whith-post-id-use-cases';
import { LogoutUserUseCases } from './features/auth/applications/use-cases/logout-user-use-cases';
import { DeleteAllDeviceSessionsUseCases } from './features/devices/applications/use-cases/delete-all-device-sessions-use-cases';
import { DeleteDeviceSessionUseCases } from './features/devices/applications/use-cases/delete-device-session-use-cases';
import { DeletePostUseCases } from './blogger/blogger_blogs/applications/use-cases/delete-post-by-blog-id-use-cases';
import { UpdatePostUseCases } from './blogger/blogger_blogs/applications/use-cases/update-post-by-blog-id-use-cases';
import { UpdatePostLikeStatusUseCases } from './features/posts/applications/use-cases/update-post-like-status-use-cases';
import { ValidatePasswordRecoveryCodeRule } from './helpers/decorators/validate-password-recovery-code.param.decorator';
import { ValidateRegistrationConfirmationCodeRule } from './helpers/decorators/validate-registration-confirmation-code.param.decorator';
import { ValidateEmailForResendCodeRule } from './helpers/decorators/validate-email-for-resend-code.param.decorator';
import {
  Blog,
  BlogSchema,
} from './blogger/blogger_blogs/applications/blogger-blogs.schema';
import { BloggerBlogsRepository } from './blogger/blogger_blogs/blogger-blogs.repository';
import { BloggerBlogsService } from './blogger/blogger_blogs/blogger-blogs.service';
import { BloggerBlogsController } from './blogger/blogger_blogs/blogger-blogs.controller';
import { SAUsersController } from './super_admin/sa_users/sa-users.controller';
import { SAUsersService } from './super_admin/sa_users/sa-users.service';
import { BanUserUseCases } from './super_admin/sa_users/applications/use-cases/ban-user-use-cases';
import { CreateUserByAdminUseCases } from './super_admin/sa_users/applications/use-cases/create-user-by-admin-use-case';
import { DeleteUserUseCases } from './super_admin/sa_users/applications/use-cases/delete-user-use-cases';
import { BindBlogWithUserUseCases } from './super_admin/sa_blogs/applications/use-cases/bind-blog-with-user-use-cases';
import { SAUsersRepository } from './super_admin/sa_users/sa-users.repository';
import { SaBlogsController } from './super_admin/sa_blogs/sa-blogs.controller';
import { SABlogsService } from './super_admin/sa_blogs/sa-blogs.service';
import { SABlogsRepository } from './super_admin/sa_blogs/sa-blogs.repository';

const useCases = [
  BanUserUseCases,
  CreateUserByAdminUseCases,
  DeleteUserUseCases,
  BindBlogWithUserUseCases,
  CreatePostWithBlogIdUseCases,
  CreateBlogUseCases,
  DeleteBlogUseCases,
  UpdateBlogUseCases,
  UpdateCommentUseCases,
  UpdateCommentLikeStatusUseCases,
  DeleteCommentUseCases,
  ConfirmEmailUseCases,
  LoginUserUseCases,
  LogoutUserUseCases,
  NewPasswordUseCases,
  PasswordRecoveryUseCases,
  RefreshTokensUseCases,
  RegistrationUserUseCases,
  ResendEmailUseCases,
  VerifyTokenUseCases,
  CreateCommentWithPostIdUseCases,
  DeleteAllDeviceSessionsUseCases,
  DeleteDeviceSessionUseCases,
  DeletePostUseCases,
  UpdatePostLikeStatusUseCases,
  UpdatePostUseCases,
];
const strategies = [
  LocalStrategy,
  JwtAccessStrategy,
  BasicStrategy,
  OptionalJwtAuthGuard,
];
const decorators = [
  BlogExistsRule,
  LoginOrEmailExistRule,
  ValidatePasswordRecoveryCodeRule,
  ValidateRegistrationConfirmationCodeRule,
  ValidateEmailForResendCodeRule,
];
const repositories = [
  SAUsersRepository,
  SABlogsRepository,
  UsersRepository,
  PostsRepository,
  DevicesRepository,
  BlogsRepository,
  CommentsRepository,
  BloggerBlogsRepository,
  BloggerBlogsService,
];
const services = [
  AuthService,
  AppService,
  SAUsersService,
  SABlogsService,
  PostsService,
  DevicesService,
  BlogsService,
  CommentsService,
];
const adapters = [EmailAdapter];
const controllers = [
  AppController,
  TestingController,
  SaBlogsController,
  SAUsersController,
  PostsController,
  BlogsController,
  CommentsController,
  AuthController,
  DevicesController,
  BloggerBlogsController,
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
