export class UserInfoDTO {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
  ) {}
}

export class AllUsersInfoDTO {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: UserInfoDTO[],
  ) {}
}

export class QueryUsersDTO {
  constructor(
    public sortBy: string,
    public sortDirection: string,
    public pageNumber: number,
    public pageSize: number,
    public searchLoginTerm: string,
    public searchEmailTerm: string,
  ) {}
}
