import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAccessAuthGuard } from '../auth/guards/jwt-access-auth.guard';
import { InputLikeStatusDTO } from '../posts/applications/posts.dto';
import { CurrentUserId } from '../auth/applications/current-user.param.decorator';
import { InputCommentDTO } from './applications/comments.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async updateLikeStatusForCommentById(
    @Param('id') id: string,
    @Body() inputData: InputLikeStatusDTO,
    @CurrentUserId() currentUserId,
  ) {
    const updateLike = await this.commentsService.updateCommentLike(
      id,
      inputData.likeStatus,
      currentUserId,
    );
    if (updateLike) return;
    const setLike = await this.commentsService.setCommentLike(
      id,
      inputData.likeStatus,
      currentUserId,
    );
    if (!setLike) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() inputData: InputCommentDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commentsService.updateComment(
      id,
      inputData,
      currentUserId,
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteComment(@Param('id') id: string, @CurrentUserId() currentUserId) {
    const result = await this.commentsService.deleteComment(id, currentUserId);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findCommentById(
    @Param('id') id: string,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.commentsService.findCommentById(
      id,
      currentUserId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }
}
