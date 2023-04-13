import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../blogs/blogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExists implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}

  async validate(value: string) {
    try {
      const blog = await this.blogsRepository.findBlogById(value);
      if (!blog) return false;
    } catch (e) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog not found`;
  }
}
