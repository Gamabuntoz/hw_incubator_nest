import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

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

export class AllBlogsInfoDTO {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: BlogInfoDTO[],
  ) {}
}

export class QueryBlogsDTO {
  constructor(
    public searchNameTerm: string,
    public sortBy: string,
    public sortDirection: string,
    public pageNumber: number,
    public pageSize: number,
  ) {}
}

export class InputBlogDTO {
  @IsString()
  @Length(1, 15)
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;
  @IsString()
  @Length(1, 500)
  description: string;
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}
