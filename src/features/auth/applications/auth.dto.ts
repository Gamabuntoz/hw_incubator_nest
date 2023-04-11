import { IsAlphanumeric, IsEmail, IsString, Length } from 'class-validator';

export class InputEmailDTO {
  @IsEmail()
  email: string;
}

export class InputRegistrationDTO {
  @Length(3, 10)
  @IsAlphanumeric()
  login: string;
  @IsString()
  @Length(6, 20)
  password: string;
  @IsEmail()
  email: string;
}

export class InputConfirmationCodeDTO {
  @IsString()
  code: string;
}

export class InputLoginDTO {
  @IsString()
  loginOrEmail: string;
  @IsString()
  password: string;
}

export class InputNewPassDTO {
  @Length(6, 20)
  @IsString()
  newPassword: string;
  @IsString()
  recoveryCode: string;
}

export class CurrentUserInfo {
  constructor(
    public email: string,
    public login: string,
    public userId: string,
  ) {}
}
