import { Types } from 'mongoose';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { InputPostDTO, PostInfoDTO } from '../posts.dto';
import { PostsRepository } from '../../posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';

export class CreatePostWithBlogIdCommand {
  constructor(public id: Types.ObjectId, public inputData: InputPostDTO) {}
}

@CommandHandler(CreatePostWithBlogIdCommand)
export class CreatePostWithBlogIdUseCases
  implements ICommandHandler<CreatePostWithBlogIdCommand>
{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(
    command: CreatePostWithBlogIdCommand,
  ): Promise<Result<PostInfoDTO>> {
    const blogById = await this.blogsRepository.findBlogById(command.id);
    if (!blogById)
      return new Result<PostInfoDTO>(
        ResultCode.NotFound,
        null,
        'Blog not found',
      );
    const newPost = {
      _id: new Types.ObjectId(),
      title: command.inputData.title,
      shortDescription: command.inputData.shortDescription,
      content: command.inputData.content,
      blogId: blogById._id.toString(),
      blogName: blogById.name,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      dislikeCount: 0,
    };
    await this.postsRepository.createPost(newPost);
    const postView = new PostInfoDTO(
      newPost._id?.toString(),
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.blogId,
      newPost.blogName,
      newPost.createdAt,
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    );
    return new Result<PostInfoDTO>(ResultCode.Success, postView, null);
  }
}
