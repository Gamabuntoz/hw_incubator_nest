import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { InputPostWithIdDTO, PostInfoDTO, QueryPostsDTO } from './posts.dto';
import { Types } from 'mongoose';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentInfoDTO } from '../comments/comments.dto';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
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

  async updatePostLike(postId: string, likeStatus: string, userId: string) {
    const updateLike = await this.postsRepository.updatePostLike(
      likeStatus,
      postId,
      userId,
    );
    if (!updateLike) return false;
    return true;
  }

  async setPostLike(postId: string, likeStatus: string, userId: string) {
    const postLike = {
      _id: new Types.ObjectId(),
      userId: userId,
      postId: postId,
      status: likeStatus,
      addedAt: new Date(),
    };
    await this.postsRepository.setPostLike(postLike);
    return true;
  }

  async createCommentByPostId(postId: string, content: string, userId: string) {
    const user = await this.usersRepository.findUserById(userId);
    const postById = await this.postsRepository.findPostById(postId);
    if (!postById) return false;
    const newComment = {
      _id: new Types.ObjectId(),
      postId: postId,
      content: content,
      userId: userId,
      userLogin: user.accountData.login,
      createdAt: new Date().toISOString(),
    };
    await this.commentsRepository.createComment(newComment);
    return new CommentInfoDTO(
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
  }

  async updatePost(id: string, inputPostData: InputPostWithIdDTO) {
    return this.postsRepository.updatePost(id, inputPostData);
  }

  async deletePost(id: string) {
    return this.postsRepository.deletePost(id);
  }
}
