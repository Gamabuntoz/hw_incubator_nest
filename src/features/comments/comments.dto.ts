import { IsString, Length } from 'class-validator';

export class CommentInfoDTO {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public createdAt: string,
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
    },
  ) {}
}

export class AllCommentsInfoDTO {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: CommentInfoDTO[],
  ) {}
}

export class InputCommentDTO {
  @Length(20, 300)
  @IsString()
  content: string;
}
