import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { InputUserDTO, QueryUsersDTO } from './users.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { tryObjectId } from '../../app.service';

@Controller('users')
export class UsersController {
  constructor(protected userService: UsersService) {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getUsers(@Query() query: QueryUsersDTO) {
    return this.userService.findUsers(query);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() inputData: InputUserDTO) {
    return this.userService.createUser(inputData);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    tryObjectId(id);
    const result = await this.userService.deleteUser(id);
    if (!result) throw new NotFoundException();
    return;
  }
}
