import {
  Body,
  Controller,
  Delete,
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
import { InputCommentDTO } from '../comments/applications/comments.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { JwtAccessAuthGuard } from '../auth/guards/jwt-access-auth.guard';
import { CurrentUserId } from '../auth/applications/current-user.param.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import {
  CreatePostWithBlogIdCommand,
  CreatePostWithBlogIdUseCases,
} from '../blogs/use-cases/create-post-whith-blog-id-use-cases';
import { TryObjectIdPipe } from '../auth/applications/try-object-id.param.decorator';
import { Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsService: PostsService,
    protected createPostWithBlogIdUseCases: CreatePostWithBlogIdUseCases,
  ) {}

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async updateLikeStatusForPostById(
    @Param('id') id: string,
    @Body() inputData: InputLikeStatusDTO,
    @CurrentUserId() currentUserId,
  ) {
    const updateLike = await this.postsService.updatePostLike(
      id,
      inputData.likeStatus,
      currentUserId,
    );
    if (updateLike) return;
    const setLike = await this.postsService.setPostLike(
      id,
      inputData.likeStatus,
      currentUserId,
    );
    if (!setLike) throw new NotFoundException();
    return;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id/comments')
  async findCommentsByPostId(
    @Param('id') id: string,
    @Query() query: QueryPostsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.findCommentsByPostId(
      id,
      query,
      currentUserId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/comments')
  async createCommentByPostId(
    @Param('id') id: string,
    @Body() inputData: InputCommentDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.postsService.createCommentByPostId(
      id,
      inputData.content,
      currentUserId,
    );
    if (!result) throw new NotFoundException();
    return result;
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

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findPostById(@Param('id') id: string, @CurrentUserId() currentUserId) {
    const result = await this.postsService.findPostById(id, currentUserId);
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() inputData: InputPostWithIdDTO,
  ) {
    const result = await this.postsService.updatePost(id, inputData);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    const result = await this.postsService.deletePost(id);
    if (!result) throw new NotFoundException();
    return;
  }
}
