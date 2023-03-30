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
  name: string;
  description: string;
  websiteUrl: string;
}
