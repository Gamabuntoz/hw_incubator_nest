import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

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
export class Paginated<T> {
  @IsNumber()
  @IsOptional()
  public pagesCount = 10;
  public page: number;
  public pageSize = 1;
  public totalCount: number;
  public items: T;

  static getPaginated<T>(data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    items: T;
  }): Paginated<T> {
    return {
      totalCount: data.totalCount,
      items: data.items,
      page: data.pageNumber,
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      pageSize: data.pageSize,
    };
  }
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
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  content: string;
}

export enum ResultCode {
  Success,
  Forbidden,
  NotFound,
  BadRequest,
  Unauthorized,
}

export class Result<T> {
  constructor(
    public code: number,
    public data: T | null,
    public errorMessage: string | null,
  ) {}
  static sendResultError(result: number) {
    switch (result) {
      case ResultCode.NotFound:
        throw new NotFoundException();
      case ResultCode.Forbidden:
        throw new ForbiddenException();
      case ResultCode.BadRequest:
        throw new BadRequestException();
    }
  }
}
