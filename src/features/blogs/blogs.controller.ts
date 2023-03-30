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
import { QueryPostsDTO } from '../posts/posts.dto';
import { BlogsService } from './blogs.service';
import { InputBlogDTO, QueryBlogsDTO } from './blogs.dto';
import { InputPostDTO } from '../posts/posts.dto';

@Controller('blogs')
export class BlogsController {
  constructor(protected blogsService: BlogsService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':id/posts')
  async findAllPostsByBlogId(
    @Param('id') id: string,
    @Query() query: QueryPostsDTO,
  ) {
    const result = await this.blogsService.findAllPostsByBlogId(id, query);
    if (!result) throw new NotFoundException();
    return result;
  }

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

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async updateBlog(@Param('id') id: string, @Body() inputData: InputBlogDTO) {
    const result = await this.blogsService.updateBlog(id, inputData);
    if (!result) throw new NotFoundException();
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    const result = await this.blogsService.deleteBlog(id);
    if (!result) throw new NotFoundException();
    return;
  }
}
