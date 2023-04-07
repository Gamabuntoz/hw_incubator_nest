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
  InputLikeStatusForPostDTO,
  InputPostWithIdDTO,
  QueryPostsDTO,
} from './posts.dto';
import { InputCommentDTO } from '../comments/comments.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/current-user.param.decorator';

@Controller('posts')
export class PostsController {
  constructor(protected postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateLikeStatusForPostById(
    @Param('id') id: string,
    @Body() inputData: InputLikeStatusForPostDTO,
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

  @HttpCode(HttpStatus.OK)
  @Get(':id/comments')
  async findCommentsByPostId(
    @Param('id') id: string,
    @Query() query: QueryPostsDTO,
  ) {
    const result = await this.postsService.findCommentsByPostId(id, query);
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAuthGuard)
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

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPosts(@Query() query: QueryPostsDTO) {
    return this.postsService.findAllPosts(query);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPost(@Body() inputData: InputPostWithIdDTO) {
    return this.postsService.createPost(inputData);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findPostById(@Param('id') id: string) {
    const result = await this.postsService.findPostById(id);
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
