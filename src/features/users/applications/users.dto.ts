export class UserInfoDTO {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
  ) {}
}

export class QueryUsersDTO {
  constructor(
    public sortBy: string = 'createdAt',
    public sortDirection: string = 'desc',
    public pageNumber: number = 1,
    public pageSize: number = 10,
    public searchLoginTerm: string,
    public searchEmailTerm: string,
  ) {}
}
