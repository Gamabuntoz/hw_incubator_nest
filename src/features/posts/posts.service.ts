import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { InputPostWithIdDTO, PostInfoDTO, QueryPostsDTO } from './posts.dto';
import { Types } from 'mongoose';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { BlogInfoDTO } from '../blogs/blogs.dto';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async findCommentsByPostId(id: string, term: QueryPostsDTO) {
    const postById = await this.postsRepository.findPostById(id);
    if (!postById) return false;
    const queryData = new QueryPostsDTO(
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
    );
    return this.commentsRepository.findAllCommentsByPostId(id, queryData);
  }

  async findAllPosts(term: QueryPostsDTO) {
    const queryData = new QueryPostsDTO(
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
    );
    return this.postsRepository.findAllPosts(queryData);
  }

  async createPost(inputData: InputPostWithIdDTO) {
    const blogById = await this.blogsRepository.findBlogById(inputData.blogId);
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
    const postById = await this.postsRepository.findPostById(id);
    if (!postById) return false;
    return new PostInfoDTO(
      postById._id.toString(),
      postById.title,
      postById.shortDescription,
      postById.content,
      postById.blogId,
      postById.blogName,
      postById.createdAt,
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    );
  }

  async updatePost(id: string, inputPostData: InputPostWithIdDTO) {
    return this.postsRepository.updatePost(id, inputPostData);
  }

  async deletePost(id: string) {
    return this.postsRepository.deletePost(id);
  }
}
