import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoles } from '../enums/user-roles.enum';

export class CreateUserDTO {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsOptional()
  roles?: UserRoles;

  @ApiProperty()
  notificationFilters;
}
