import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../../../features/posts/posts.repository';
import { InputPostDTO } from '../../../../features/posts/applications/posts.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Blog } from '../blogger-blogs.schema';
import { BloggerBlogsRepository } from '../../blogger-blogs.repository';

export class UpdatePostCommand {
  constructor(
    public blogId: Types.ObjectId,
    public postId: Types.ObjectId,
    public inputPostData: InputPostDTO,
    public currentUserId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCases implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private bloggerBlogsRepository: BloggerBlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<Result<boolean>> {
    const blog: Blog = await this.bloggerBlogsRepository.findBlogById(
      command.blogId,
    );
    if (!blog)
      return new Result<boolean>(ResultCode.NotFound, false, 'Blog not found');
    if (blog.ownerId !== command.currentUserId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    const updatedPost = await this.postsRepository.updatePost(
      command.postId,
      command.inputPostData,
    );
    if (!updatedPost)
      return new Result<boolean>(ResultCode.NotFound, false, 'Post not found');
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
