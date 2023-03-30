import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ required: true })
  _id: Types.ObjectId;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true })
  createdAt: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
