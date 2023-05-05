import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class SAUserInfoDTO {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
    public banInfo: {
      isBanned: boolean;
      banDate: string | null;
      banReason: string | null;
    },
  ) {}
}

export class InputBanUserDTO {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
  @IsString()
  @Length(1, 20)
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  banReason: string;
}

export class QueryUsersDTO {
  constructor(
    public banStatus: string,
    public sortBy: string = 'createdAt',
    public sortDirection: string = 'desc',
    public pageNumber: number = 1,
    public pageSize: number = 10,
    public searchLoginTerm: string,
    public searchEmailTerm: string,
  ) {}
}
