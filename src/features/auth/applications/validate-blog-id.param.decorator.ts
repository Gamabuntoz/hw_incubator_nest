import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { ModuleRef } from '@nestjs/core';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}

  async validate(value: string) {
    try {
      const blog = await this.blogsRepository.findBlogById(value);
      return blog ? true : false;
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return `Blog doesn't exist`;
  }
}
/*@ValidatorConstraint({ async: true })
export class BlogExistsConstraint implements ValidatorConstraintInterface {
  constructor(private moduleRef: ModuleRef) {}
  async validate(value: any, args: ValidationArguments) {
    const blogsRepository = await this.moduleRef.resolve(BlogsRepository);
    return blogsRepository.findBlogById(value).then((blog) => {
      if (blog) return false;
      return true;
    });
  }
}

export function BlogExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlogExistsConstraint,
    });
  };
}*/
