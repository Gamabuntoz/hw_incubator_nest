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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InputPostWithIdDTO, QueryPostsDTO } from './posts.dto';

@Controller('posts')
export class PostsController {
  constructor(protected postsService: PostsService) {}

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

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPosts(@Query() query: QueryPostsDTO) {
    return this.postsService.findAllPosts(query);
  }

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

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() inputData: InputPostWithIdDTO,
  ) {
    const result = await this.postsService.updatePost(id, inputData);
    if (!result) throw new NotFoundException();
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    const result = await this.postsService.deletePost(id);
    if (!result) throw new NotFoundException();
    return;
  }
}
