import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop({ required: true })
  _id: Types.ObjectId;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  isMembership: boolean;
  @Prop({ required: true })
  ownerId: string;
  @Prop({ required: true })
  ownerLogin: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
