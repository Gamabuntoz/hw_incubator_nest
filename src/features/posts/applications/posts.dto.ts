import { Contains, IsIn, IsString, Length } from 'class-validator';

type newestLikesType = {
  addedAt: string;
  userId: string;
  login: string;
};

export class PostInfoDTO {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
      newestLikes: newestLikesType[];
    },
  ) {}
}

export class AllPostsInfoDTO {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: PostInfoDTO[],
  ) {}
}

export class QueryPostsDTO {
  constructor(
    public sortBy: string,
    public sortDirection: string,
    public pageNumber: number,
    public pageSize: number,
  ) {}
}

export class InputPostWithIdDTO {
  @Length(1, 30)
  @IsString()
  title: string;
  @Length(1, 100)
  @IsString()
  shortDescription: string;
  @Length(1, 1000)
  @IsString()
  content: string;
  @IsString()
  blogId: string;
}

export class InputPostDTO {
  @Length(1, 30)
  @IsString()
  title: string;
  @Length(1, 100)
  @IsString()
  shortDescription: string;
  @Length(1, 1000)
  @IsString()
  content: string;
}

const LikeStatus = ['None', 'Like', 'Dislike'];

export class InputLikeStatusDTO {
  @IsIn(LikeStatus)
  likeStatus: string;
}
