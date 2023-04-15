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
import { QueryPostsDTO } from '../posts/applications/posts.dto';
import { BlogsService } from './blogs.service';
import { InputBlogDTO, QueryBlogsDTO } from './applications/blogs.dto';
import { InputPostDTO } from '../posts/applications/posts.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUserId } from '../auth/applications/current-user.param.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('blogs')
export class BlogsController {
  constructor(protected blogsService: BlogsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id/posts')
  async findAllPostsByBlogId(
    @Param('id') id: string,
    @Query() query: QueryPostsDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.blogsService.findAllPostsByBlogId(
      id,
      query,
      currentUserId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() inputData: InputPostDTO,
  ) {
    const result = await this.blogsService.createPostByBlogId(id, inputData);
    if (!result) throw new NotFoundException();
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllBlogs(@Query() query: QueryBlogsDTO) {
    return this.blogsService.findAllBlogs(query);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(@Body() inputData: InputBlogDTO) {
    return this.blogsService.createBlog(inputData);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findBlogById(@Param('id') id: string) {
    const result = await this.blogsService.findBlogById(id);
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(@Param('id') id: string, @Body() inputData: InputBlogDTO) {
    const result = await this.blogsService.updateBlog(id, inputData);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    const result = await this.blogsService.deleteBlog(id);
    if (!result) throw new NotFoundException();
    return;
  }
}
