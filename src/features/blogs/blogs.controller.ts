import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryPostsDTO } from '../posts/applications/posts.dto';
import { InputBlogDTO, QueryBlogsDTO } from './applications/blogs.dto';
import { InputPostDTO } from '../posts/applications/posts.dto';
import { BasicAuthGuard } from '../../security/guards/basic-auth.guard';
import { OptionalJwtAuthGuard } from '../../security/guards/optional-jwt-auth.guard';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { BlogsService } from './blogs.service';
import { CreateBlogCommand } from './applications/use-cases/create-blog-use-cases';
import { CreatePostWithBlogIdCommand } from '../posts/applications/use-cases/create-post-whith-blog-id-use-cases';
import { Types } from 'mongoose';
import { UpdateBlogCommand } from './applications/use-cases/update-blog-use-cases';
import { DeleteBlogCommand } from './applications/use-cases/delete-blog-use-cases';
import { CommandBus } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../helpers/contract';

@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    protected blogsService: BlogsService,
  ) {}
  //
  //
  // Query controller
  //
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
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllBlogs(@Query() query: QueryBlogsDTO) {
    const result = await this.blogsService.findAllBlogs(query);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findBlogById(@Param('id', new TryObjectIdPipe()) id: Types.ObjectId) {
    const result = await this.blogsService.findBlogById(id);
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
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputPostDTO,
  ) {
    const result = await this.commandBus.execute(
      new CreatePostWithBlogIdCommand(id, inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(@Body() inputData: InputBlogDTO) {
    const result = await this.commandBus.execute(
      new CreateBlogCommand(inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputBlogDTO,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(id, inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id', new TryObjectIdPipe()) id: Types.ObjectId) {
    const result = await this.commandBus.execute(new DeleteBlogCommand(id));
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
