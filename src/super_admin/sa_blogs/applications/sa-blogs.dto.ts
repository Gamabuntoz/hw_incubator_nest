export class BlogInfoDTO {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public blogOwnerInfo: { userLogin: string; userId: string },
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
