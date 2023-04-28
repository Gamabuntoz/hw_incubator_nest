import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class TryObjectIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    let newValue;
    try {
      newValue = new Types.ObjectId(value);
    } catch (e) {
      throw new NotFoundException();
    }
    return newValue;
  }
}
