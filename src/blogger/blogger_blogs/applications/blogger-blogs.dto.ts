import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class BlogInfoDTO {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}

export class QueryBlogsDTO {
  constructor(
    public searchNameTerm: string,
    public sortBy: string = 'createdAt',
    public sortDirection: string = 'desc',
    public pageNumber: number = 1,
    public pageSize: number = 10,
  ) {}
}

export class InputBlogDTO {
  @IsString()
  @Length(1, 15)
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  name: string;
  @IsString()
  @Length(1, 500)
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  description: string;
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}