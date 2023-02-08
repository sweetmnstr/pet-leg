import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { User } from '../../user/user.entity';
import { AuthType } from '../enums/auth-types.enum';
import { IsJSON } from 'class-validator';

export class CreateCustomerDTO {
  @ApiProperty({ default: '{}' })
  @IsJSON()
  notificationFilters?: string;

  @ApiProperty({ default: AuthType.GOOGLE })
  authType: AuthType;

  @ApiProperty()
  user: User;
}
