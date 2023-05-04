import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../../../features/posts/posts.repository';
import { Result, ResultCode } from '../../../../helpers/contract';
import { BloggerBlogsRepository } from '../../blogger-blogs.repository';
import { Blog } from '../blogger-blogs.schema';

export class DeletePostCommand {
  constructor(
    public blogId: Types.ObjectId,
    public postId: Types.ObjectId,
    public currentUserId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCases implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<Result<boolean>> {
    const blog: Blog = await this.bloggerBlogsRepository.findBlogById(
      command.blogId,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    if (blog.ownerId !== command.currentUserId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    const deletedPost = await this.postsRepository.deletePost(command.postId);
    if (!deletedPost)
      return new Result<boolean>(ResultCode.NotFound, false, 'Post not found');
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
