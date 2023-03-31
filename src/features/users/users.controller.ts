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
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { InputUserDTO, QueryUsersDTO } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(protected userService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getUsers(@Query() query: QueryUsersDTO) {
    return this.userService.findUsers(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() inputData: InputUserDTO) {
    return this.userService.createUser(inputData);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.deleteUser(id);
    if (!result) throw new NotFoundException();
    return;
  }
}
