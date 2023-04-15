import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../blogs/blogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}

  async validate(value: string) {
    const blog = await this.blogsRepository.findBlogById(value);
    return blog ? true : false;
  }
  defaultMessage(args: ValidationArguments) {
    return `Blog doesn't exist`;
  }
}
