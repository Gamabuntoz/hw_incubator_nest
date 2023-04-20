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
import { InputBlogDTO, QueryBlogsDTO } from './applications/blogs.dto';
import { InputPostDTO } from '../posts/applications/posts.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUserId } from '../auth/applications/current-user.param.decorator';
import { TryObjectIdPipe } from '../auth/applications/try-object-id.param.decorator';
import { BlogsService } from './blogs.service';
import { CreateBlogUseCases } from './use-cases/create-blog-use-cases';
import { CreatePostWithBlogIdUseCases } from './use-cases/create-post-whith-blog-id-use-cases';
import { Types } from 'mongoose';
import { UpdateBlogUseCases } from './use-cases/update-blog-use-cases';
import { DeleteBlogUseCases } from './use-cases/delete-blog-use-cases';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected createBlogUseCases: CreateBlogUseCases,
    protected createPostByBlogIdUseCases: CreatePostWithBlogIdUseCases,
    protected updateBlogUseCase: UpdateBlogUseCases,
    protected deleteBlogUseCase: DeleteBlogUseCases,
  ) {}
  //
  // Query controller
  //
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id/posts')
  async findAllPostsByBlogId(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
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

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllBlogs(@Query() query: QueryBlogsDTO) {
    return this.blogsService.findAllBlogs(query);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findBlogById(@Param('id', new TryObjectIdPipe()) id: Types.ObjectId) {
    const result = await this.blogsService.findBlogById(id);
    if (!result) throw new NotFoundException();
    return result;
  }
  //
  // Command controller
  //
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputPostDTO,
  ) {
    const result = await this.createPostByBlogIdUseCases.execute(id, inputData);
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(@Body() inputData: InputBlogDTO) {
    return this.createBlogUseCases.execute(inputData);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputBlogDTO,
  ) {
    const result: boolean = await this.updateBlogUseCase.execute(id, inputData);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id', new TryObjectIdPipe()) id: Types.ObjectId) {
    const result: boolean = await this.deleteBlogUseCase.execute(id);
    if (!result) throw new NotFoundException();
    return;
  }
}
