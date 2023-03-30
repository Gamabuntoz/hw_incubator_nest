import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async findCommentById(id: string) {
    return this.commentsRepository.findCommentById(id);
  }
}
