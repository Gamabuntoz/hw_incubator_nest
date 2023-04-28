import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputLikeStatusDTO } from '../posts.dto';
import { PostsRepository } from '../../posts.repository';
import { PostLike } from '../posts-likes.schema';

export class UpdatePostLikeStatusCommand {
  constructor(
    public id: Types.ObjectId,
    public inputData: InputLikeStatusDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCases
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    const updateLike = await this.updatePostLike(
      command.id,
      command.inputData.likeStatus,
      command.currentUserId,
    );
    if (updateLike) return;
    const setLike = await this.setPostLike(
      command.id,
      command.inputData.likeStatus,
      command.currentUserId,
    );
    if (!setLike) return false;
    return;
  }

  private async updatePostLike(
    postId: Types.ObjectId,
    likeStatus: string,
    userId: string,
  ) {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) return false;
    const updateLike = await this.postsRepository.updatePostLike(
      postId.toString(),
      likeStatus,
      userId,
    );
    if (!updateLike) return false;
    return true;
  }

  private async setPostLike(
    postId: Types.ObjectId,
    likeStatus: string,
    userId: string,
  ) {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) return false;
    const postLike: PostLike = {
      _id: new Types.ObjectId(),
      userId: userId,
      postId: postId.toString(),
      status: likeStatus,
      addedAt: new Date(),
    };
    await this.postsRepository.setPostLike(postLike);
    return true;
  }
}
