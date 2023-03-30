import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
class AccountData {
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  passwordHash: string;
  @Prop({ required: true })
  createdAt: string;
}

@Schema()
class EmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;
  @Prop({ required: true })
  isConfirmed: boolean;
  @Prop({ required: true })
  expirationDate: Date;
}

@Schema()
class PasswordRecovery {
  @Prop()
  code: string;
  @Prop()
  expirationDate: Date;
}

const AccountDataSchema = SchemaFactory.createForClass(AccountData);
const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
const PasswordRecoverySchema = SchemaFactory.createForClass(PasswordRecovery);

@Schema()
export class User {
  @Prop({ required: true })
  _id: Types.ObjectId;
  @Prop({ type: AccountDataSchema })
  accountData: AccountData;
  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: PasswordRecoverySchema })
  passwordRecovery: PasswordRecovery;
}

export const UserSchema = SchemaFactory.createForClass(User);
