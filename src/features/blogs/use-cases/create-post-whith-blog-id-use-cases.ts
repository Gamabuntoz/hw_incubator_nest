import { Types } from 'mongoose';
import { BlogsRepository } from '../blogs.repository';
import { InputPostDTO, PostInfoDTO } from '../../posts/applications/posts.dto';
import { PostsRepository } from '../../posts/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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

  async execute(command: CreatePostWithBlogIdCommand) {
    const blogById = await this.blogsRepository.findBlogById(command.id);
    if (!blogById) return false;
    const newPost = {
      _id: new Types.ObjectId(),
      title: command.inputData.title,
      shortDescription: command.inputData.shortDescription,
      content: command.inputData.content,
      blogId: blogById._id.toString(),
      blogName: blogById.name,
      createdAt: new Date().toISOString(),
    };
    await this.postsRepository.createPost(newPost);
    return new PostInfoDTO(
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
  }
}
