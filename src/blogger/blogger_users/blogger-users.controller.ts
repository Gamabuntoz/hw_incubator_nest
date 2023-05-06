import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  InputBanUserForBlogDTO,
  QueryBannedUsersForBlogDTO,
} from './applications/blogger-users.dto';
import { BloggerBlogsService } from './blogger-users.service';
import { Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAccessAuthGuard } from 'src/security/guards/jwt-access-auth.guard';
import { Result, ResultCode } from 'src/helpers/contract';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { BanUserForBlogCommand } from './applications/use-cases/ban-user-for-blog-use-cases';

@Controller('blogger/users')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    protected bloggerBlogsService: BloggerBlogsService,
  ) {}

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllBlogs(
    @Query() query: QueryBannedUsersForBlogDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.bloggerBlogsService.findAllBlogs(
      query,
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':userId/ban')
  async updatePostByBlogId(
    @Param('userId', new TryObjectIdPipe()) userId: Types.ObjectId,
    @Body() inputData: InputBanUserForBlogDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new BanUserForBlogCommand(userId, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
