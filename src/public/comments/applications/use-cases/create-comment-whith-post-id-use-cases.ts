import { Types } from 'mongoose';
import { PostsRepository } from '../../../posts/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentInfoDTO } from '../comments.dto';
import { UsersRepository } from '../../../users/users.repository';
import { CommentsRepository } from '../../comments.repository';
import { Result, ResultCode } from '../../../../helpers/contract';
import { BloggerUsersRepository } from '../../../../blogger/blogger_users/blogger-users.repository';

export class CreateCommentWithPostIdCommand {
  constructor(
    public postId: Types.ObjectId,
    public content: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentWithPostIdCommand)
export class CreateCommentWithPostIdUseCases
  implements ICommandHandler<CreateCommentWithPostIdCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    protected bloggerUsersRepository: BloggerUsersRepository,
  ) {}

  async execute(
    command: CreateCommentWithPostIdCommand,
  ): Promise<Result<CommentInfoDTO>> {
    const user = await this.usersRepository.findUserById(command.userId);
    const postById = await this.postsRepository.findPostById(command.postId);
    if (!postById)
      return new Result<CommentInfoDTO>(
        ResultCode.NotFound,
        null,
        'Post not found',
      );
    const checkUserForBanForBlog =
      await this.bloggerUsersRepository.checkUserForBan(
        command.userId,
        postById.blogId,
      );
    if (checkUserForBanForBlog)
      return new Result<CommentInfoDTO>(
        ResultCode.BadRequest,
        null,
        'User banned for blog',
      );
    const newComment = {
      _id: new Types.ObjectId(),
      postId: command.postId.toString(),
      content: command.content,
      userId: command.userId,
      userLogin: user.accountData.login,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      dislikeCount: 0,
    };
    await this.commentsRepository.createComment(newComment);
    const commentView = new CommentInfoDTO(
      newComment._id.toString(),
      newComment.content,
      {
        userId: newComment.userId,
        userLogin: newComment.userLogin,
      },
      newComment.createdAt,
      {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
      },
    );
    return new Result<CommentInfoDTO>(ResultCode.Success, commentView, null);
  }
}
