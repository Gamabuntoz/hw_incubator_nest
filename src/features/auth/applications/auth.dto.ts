import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class InputEmailDTO {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  email: string;
}

export class InputRegistrationDTO {
  @Length(3, 10)
  @IsAlphanumeric()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  login: string;
  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  password: string;
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  email: string;
}

export class InputConfirmationCodeDTO {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  code: string;
}

export class InputLoginDTO {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  loginOrEmail: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  password: string;
}

export class InputNewPassDTO {
  @Length(6, 20)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  newPassword: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'number') {
      return value;
    }
    return value?.trim();
  })
  recoveryCode: string;
}

export class CurrentUserInfo {
  constructor(
    public email: string,
    public login: string,
    public userId: string,
  ) {}
}
