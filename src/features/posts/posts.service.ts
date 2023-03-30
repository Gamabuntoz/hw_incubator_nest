import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { InputPostWithIdDTO, PostInfoDTO, QueryPostsDTO } from './posts.dto';
import { Types } from 'mongoose';
import { BlogsRepository } from '../blogs/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postRepository: PostsRepository,
    protected blogRepository: BlogsRepository,
  ) {}

  async findCommentsByPostId(id: string, term: QueryPostsDTO) {
    return this.postRepository.findCommentsByPostId(id, term);
  }

  async findAllPosts(term: QueryPostsDTO) {
    return this.postRepository.getAllPosts(term);
  }

  async createPost(inputData: InputPostWithIdDTO) {
    const blogById = await this.blogRepository.findBlogById(inputData.blogId);
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
    await this.postRepository.createPost(newPost);
    return new PostInfoDTO(
      newPost._id!.toString(),
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

  async findPostById(id: string) {
    return this.postRepository.findPostById(id);
  }

  async updatePost(id: string, inputPostData: InputPostWithIdDTO) {
    return this.postRepository.updatePost(id, inputPostData);
  }

  async deletePost(id: string) {
    return this.postRepository.deletePost(id);
  }
}
