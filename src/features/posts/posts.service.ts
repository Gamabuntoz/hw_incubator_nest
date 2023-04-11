import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import {
  AllPostsInfoDTO,
  InputPostWithIdDTO,
  PostInfoDTO,
  QueryPostsDTO,
} from './applications/posts.dto';
import { Types } from 'mongoose';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentInfoDTO } from '../comments/applications/comments.dto';
import { tryObjectId } from '../../app.service';
import { Post } from './applications/posts.schema';
import { PostLike } from './applications/posts-likes.schema';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected commentsRepository: CommentsRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async findCommentsByPostId(id: string, term: QueryPostsDTO) {
    tryObjectId(id);
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

  async findAllPosts(term: QueryPostsDTO, userId?: string) {
    const queryData = new QueryPostsDTO(
      term.sortBy,
      term.sortDirection,
      +(term.pageNumber ?? 1),
      +(term.pageSize ?? 10),
    );
    const totalCount = await this.postsRepository.totalCountPost();
    const allPosts = await this.postsRepository.findAllPosts(queryData);
    return new AllPostsInfoDTO(
      Math.ceil(totalCount / queryData.pageSize),
      queryData.pageNumber,
      queryData.pageSize,
      totalCount,
      await Promise.all(
        allPosts.map(async (p) => {
          let likeInfo;
          if (userId) {
            likeInfo = await this.postsRepository.findPostLikeByPostAndUserId(
              p._id.toString(),
              userId,
            );
          }
          const likesInfo = await this.postsRepository.countLikeStatusInfo(
            p._id.toString(),
            'Like',
          );
          const dislikesInfo = await this.postsRepository.countLikeStatusInfo(
            p._id.toString(),
            'Dislike',
          );
          const lastPostLikes = await this.postsRepository.findLastPostLikes(
            p._id.toString(),
          );
          return this.postViewInfo(
            p,
            lastPostLikes,
            likesInfo,
            dislikesInfo,
            likeInfo,
          );
        }),
      ),
    );
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

  async findPostById(id: string, userId?: string) {
    tryObjectId(id);
    const postById = await this.postsRepository.findPostById(id);
    if (!postById) return false;
    const likesInfo = await this.postsRepository.countLikeStatusInfo(
      id,
      'Like',
    );
    const dislikesInfo = await this.postsRepository.countLikeStatusInfo(
      id,
      'Dislike',
    );
    let likeInfo;
    if (userId) {
      likeInfo = await this.postsRepository.findPostLikeByPostAndUserId(
        id,
        userId,
      );
    }
    const lastPostLikes = await this.postsRepository.findLastPostLikes(id);
    return this.postViewInfo(
      postById,
      lastPostLikes,
      likesInfo,
      dislikesInfo,
      likeInfo,
    );
  }

  async updatePostLike(postId: string, likeStatus: string, userId: string) {
    tryObjectId(postId);
    const updateLike = await this.postsRepository.updatePostLike(
      likeStatus,
      postId,
      userId,
    );
    if (!updateLike) return false;
    return true;
  }

  async setPostLike(postId: string, likeStatus: string, userId: string) {
    tryObjectId(postId);
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
    tryObjectId(postId);
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
    tryObjectId(id);
    return this.postsRepository.updatePost(id, inputPostData);
  }

  async deletePost(id: string) {
    tryObjectId(id);
    return this.postsRepository.deletePost(id);
  }

  async postViewInfo(
    post: Post,
    lastPostLikes: PostLike[],
    likesInfo: number,
    dislikesInfo: number,
    likeStatusCurrentUser?: PostLike,
  ) {
    return new PostInfoDTO(
      post._id.toString(),
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      {
        likesCount: likesInfo,
        dislikesCount: dislikesInfo,
        myStatus: likeStatusCurrentUser ? likeStatusCurrentUser.status : 'None',
        newestLikes: await Promise.all(
          lastPostLikes.map(async (l) => {
            const user = await this.usersRepository.findUserById(l.userId);
            return {
              addedAt: l.addedAt.toISOString(),
              userId: l.userId,
              login: user!.accountData.login,
            };
          }),
        ),
      },
    );
  }
}
