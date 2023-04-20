import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogsRepository } from '../blogs.repository';
import { InputPostDTO, PostInfoDTO } from '../../posts/applications/posts.dto';
import { PostsRepository } from '../../posts/posts.repository';

@Injectable()
export class CreatePostWithBlogIdUseCases {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(id: Types.ObjectId, inputData: InputPostDTO) {
    const blogById = await this.blogsRepository.findBlogById(id);
    if (!blogById) return false;
    const newPost = {
      _id: new Types.ObjectId(),
      title: inputData.title,
      shortDescription: inputData.shortDescription,
      content: inputData.content,
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
