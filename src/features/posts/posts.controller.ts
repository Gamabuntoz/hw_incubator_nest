import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  InputLikeStatusDTO,
  InputPostWithIdDTO,
  QueryPostsDTO,
} from './applications/posts.dto';
import {
  InputCommentDTO,
  Result,
  ResultCode,
} from '../comments/applications/comments.dto';
import { BasicAuthGuard } from '../../security/guards/basic-auth.guard';
import { JwtAccessAuthGuard } from '../../security/guards/jwt-access-auth.guard';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { OptionalJwtAuthGuard } from '../../security/guards/optional-jwt-auth.guard';
import {
  CreatePostWithBlogIdCommand,
  CreatePostWithBlogIdUseCases,
} from './applications/use-cases/create-post-whith-blog-id-use-cases';
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { DeletePostCommand } from './applications/use-cases/delete-post-use-cases';
import { UpdatePostCommand } from './applications/use-cases/update-post-use-cases';
import { UpdatePostLikeStatusCommand } from './applications/use-cases/update-post-like-status-use-cases';
import { CreateCommentWithPostIdCommand } from '../comments/applications/use-cases/create-comment-whith-post-id-use-cases';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsService: PostsService,
  ) {}
  //
  //
  // Query controller
  //
  //
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id/comments')
  async findCommentsByPostId(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Query() query: QueryPostsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.findCommentsByPostId(
      id,
      query,
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPosts(
    @Query() query: QueryPostsDTO,
    @CurrentUserId() currentUserId,
  ) {
    return this.postsService.findAllPosts(query, currentUserId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findPostById(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.findPostById(id, currentUserId);
    if (!result) throw new NotFoundException();
    return result;
  }
  //
  //
  // Command controller
  //
  //
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/comments')
  async createCommentByPostId(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputCommentDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new CreateCommentWithPostIdCommand(id, inputData.content, currentUserId),
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPost(
    @Body() inputData: InputPostWithIdDTO,
    @Body('blogId', new TryObjectIdPipe()) id: Types.ObjectId,
  ) {
    const result = await this.commandBus.execute(
      new CreatePostWithBlogIdCommand(id, inputData),
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async updateLikeStatusForPostById(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputLikeStatusDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result: boolean = await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(id, inputData, currentUserId),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePost(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputPostWithIdDTO,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostCommand(id, inputData),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(@Param('id', new TryObjectIdPipe()) id: Types.ObjectId) {
    const result = await this.commandBus.execute(new DeletePostCommand(id));
    if (!result) throw new NotFoundException();
    return;
  }
}
