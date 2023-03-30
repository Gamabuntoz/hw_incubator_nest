import { Injectable } from '@nestjs/common';
import { QueryPostsDTO } from '../posts/posts.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogInfoDTO, InputBlogDTO, QueryBlogsDTO } from './blogs.dto';
import { Types } from 'mongoose';
import { InputPostDTO, PostInfoDTO } from '../posts/posts.dto';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postRepository: PostsRepository,
  ) {}

  async findAllPostsByBlogId(id: string, term: QueryPostsDTO) {
    const blogById = await this.findBlogById(id);
    if (!blogById) return false;
    const queryData = new QueryPostsDTO(
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
    );
    return this.postRepository.findAllPostsByBlogId(id, queryData);
  }

  async createPostByBlogId(id: string, inputData: InputPostDTO) {
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

  async findAllBlogs(term: QueryBlogsDTO) {
    const queryData = new QueryBlogsDTO(
      term.searchNameTerm,
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
    );
    return this.blogsRepository.findAllBlogs(queryData);
  }

  async createBlog(inputData: InputBlogDTO) {
    const newBlog = {
      _id: new Types.ObjectId(),
      createdAt: new Date().toISOString(),
      name: inputData.name,
      description: inputData.description,
      websiteUrl: inputData.websiteUrl,
      isMembership: true,
    };
    await this.blogsRepository.createBlog(newBlog);
    return new BlogInfoDTO(
      newBlog._id.toString(),
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt,
      newBlog.isMembership,
    );
  }

  async findBlogById(id: string) {
    const blogById = await this.blogsRepository.findBlogById(id);
    if (!blogById) return false;
    return new BlogInfoDTO(
      blogById._id.toString(),
      blogById.name,
      blogById.description,
      blogById.websiteUrl,
      blogById.createdAt,
      blogById.isMembership,
    );
  }

  async updateBlog(id: string, inputBlogData: InputBlogDTO) {
    return this.blogsRepository.updateBlog(id, inputBlogData);
  }

  async deleteBlog(id: string) {
    return this.blogsRepository.deleteBlog(id);
  }
}
