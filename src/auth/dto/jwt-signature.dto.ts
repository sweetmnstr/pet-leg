import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsNumber, IsString } from 'class-validator';
import { UserRoles } from '../../user/enums/user-roles.enum';
export class JwtSignatureDTO {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  customerId?: number;

  @ApiProperty()
  @IsNumber()
  lawyerId?: number;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  roles: UserRoles;

  @ApiProperty()
  @IsString()
  twilioIdentitySid: string;
}
