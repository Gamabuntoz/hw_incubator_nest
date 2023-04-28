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
import { BasicAuthGuard } from '../../security/guards/basic-auth.guard';
import { InputRegistrationDTO } from '../auth/applications/auth.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateConfirmedUserCommand } from './applications/use-cases/create-confirmed-user-use-cases';
import { TryObjectIdPipe } from '../../helpers/decorators/try-object-id.param.decorator';
import { Types } from 'mongoose';
import { DeleteUserCommand } from './applications/use-cases/delete-user-use-cases';

@Controller('users')
export class UsersController {
  constructor(
    protected userService: UsersService,
    private commandBus: CommandBus,
  ) {}
  //
  //
  // Query controller
  //
  //
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getUsers(@Query() query: QueryUsersDTO) {
    return this.userService.findUsers(query);
  }
  //
  //
  // Command controller
  //
  //
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() inputData: InputRegistrationDTO) {
    return this.commandBus.execute(new CreateConfirmedUserCommand(inputData));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteUser(@Param('id', new TryObjectIdPipe()) id: Types.ObjectId) {
    const result = await this.commandBus.execute(new DeleteUserCommand(id));
    if (!result) throw new NotFoundException();
    return;
  }
}
