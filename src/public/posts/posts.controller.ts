import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InputLikeStatusDTO, QueryPostsDTO } from './applications/posts.dto';
import { InputCommentDTO } from '../comments/applications/comments.dto';
import { JwtAccessAuthGuard } from '../../security/guards/jwt-access-auth.guard';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { OptionalJwtAuthGuard } from '../../security/guards/optional-jwt-auth.guard';
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostLikeStatusCommand } from './applications/use-cases/update-post-like-status-use-cases';
import { CreateCommentWithPostIdCommand } from '../comments/applications/use-cases/create-comment-whith-post-id-use-cases';
import { Result, ResultCode } from '../../helpers/contract';

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
    const result = await this.postsService.findAllPosts(query, currentUserId);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findPostById(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.findPostById(id, currentUserId);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
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
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async updateLikeStatusForPostById(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputLikeStatusDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(id, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
