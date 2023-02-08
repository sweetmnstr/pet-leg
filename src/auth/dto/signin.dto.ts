import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserRoles } from '../../user/enums/user-roles.enum';
export class SignInDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  roles?: UserRoles;
}
