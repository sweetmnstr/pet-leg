import {
  Controller,
  Get,
  Patch,
  Body,
  HttpCode,
  BadRequestException,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { SignInDto } from '../auth/dto/signin.dto';
import { UsersTitlesDto } from './dto/users-titles.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from './enums/user-roles.enum';

@Controller('user')
export class UserController {
  constructor(public service: UserService) {}

  @Get('/create')
  async createUser(createUserDTO: CreateUserDTO): Promise<string> {
    await this.service.createUser(createUserDTO);

    return (await this.service.find({})).reduce(
      (acc, usr) => acc.concat(usr.firstName, ' '),
      '',
    );
  }

  @Patch('/update-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  async updatePassword(
    @Req() req: Express.Request,
    @Body() updatePasswordDTO: UpdatePasswordDTO,
  ): Promise<void> {
    const user = await this.service.getUserByAuth(req.user as SignInDto);

    const { password, repeatedPassword } = updatePasswordDTO;
    if (password !== repeatedPassword)
      throw new BadRequestException(`Passwords don't match`);

    return this.service.updatePassword(+user.id, password);
  }

  @Post('get-users-titles')
  @Roles(UserRoles.Lawyer, UserRoles.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsersTitles(
    @Body() usersIdentities: { usersIdentities: string[] },
  ): Promise<UsersTitlesDto[]> {
    return this.service.getUsersTitles(usersIdentities);
  }
}
