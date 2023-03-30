import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Model } from 'mongoose';
@Controller('testing')
export class TestingController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all-data')
  async deleteAllData() {
    {
    }
    const result = await this.userModel.deleteMany({});
    return;
  }
}
