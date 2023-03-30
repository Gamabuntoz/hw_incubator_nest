import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findCommentById(@Param('id') id: string) {
    const result = await this.commentsService.findCommentById(id);
    if (!result) throw new NotFoundException();
    return result;
  }
}
