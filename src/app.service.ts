import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
export const tryObjectId = (id: string) => {
  try {
    new Types.ObjectId(id);
  } catch (error) {
    throw new NotFoundException();
  }
};
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
