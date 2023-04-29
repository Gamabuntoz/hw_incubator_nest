import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAccessAuthGuard } from '../../security/guards/jwt-access-auth.guard';
import { InputLikeStatusDTO } from '../posts/applications/posts.dto';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { InputCommentDTO } from './applications/comments.dto';
import { OptionalJwtAuthGuard } from '../../security/guards/optional-jwt-auth.guard';
import { UpdateCommentLikeStatusCommand } from './applications/use-cases/update-comment-like-status-use-cases';
import { CommandBus } from '@nestjs/cqrs';
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { Types } from 'mongoose';
import { UpdateCommentCommand } from './applications/use-cases/update-comment-use-cases';
import { DeleteCommentCommand } from './applications/use-cases/delete-comment-use-cases';
import { Result, ResultCode } from '../../helpers/contract';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    private commandBus: CommandBus,
  ) {}
  //
  //
  // Query controller
  //
  //
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findCommentById(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commentsService.findCommentById(
      id,
      currentUserId,
    );
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async updateLikeStatusForCommentById(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputLikeStatusDTO,
    @CurrentUserId() currentUserId: string,
  ) {
    const result = await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(id, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateComment(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @Body() inputData: InputCommentDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new UpdateCommentCommand(id, inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteComment(
    @Param('id', new TryObjectIdPipe()) id: Types.ObjectId,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commandBus.execute(
      new DeleteCommentCommand(id, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
