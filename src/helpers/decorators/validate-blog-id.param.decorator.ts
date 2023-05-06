import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../public/blogs/blogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}

  async validate(value: string) {
    const blog = await this.blogsRepository.findBlogById(
      new Types.ObjectId(value),
    );
    return !!blog;
  }
  defaultMessage() {
    return `Blog doesn't exist`;
  }
}
