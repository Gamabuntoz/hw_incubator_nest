import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BannedUserForBlogDocument = HydratedDocument<BannedUserForBlog>;

@Schema()
export class BannedUserForBlog {
  @Prop({ required: true })
  _id: Types.ObjectId;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  isBanned: boolean;
  @Prop({ required: true })
  banDate: Date | null;
  @Prop({ required: true })
  banReason: string | null;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
}

export const BannedUserForBlogSchema =
  SchemaFactory.createForClass(BannedUserForBlog);
