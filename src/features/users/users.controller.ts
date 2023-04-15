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
import { QueryUsersDTO } from './applications/users.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { InputRegistrationDTO } from '../auth/applications/auth.dto';

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
  async createUser(@Body() inputData: InputRegistrationDTO) {
    return this.userService.createConfirmedUser(inputData);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.deleteUser(id);
    if (!result) throw new NotFoundException();
    return;
  }
}
