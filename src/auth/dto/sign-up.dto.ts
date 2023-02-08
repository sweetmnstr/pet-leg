import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { AuthType } from '../../customer/enums/auth-types.enum';
import { CreateUserDTO } from '../../user/dto/create-user.dto';

export class SignUpDTO extends CreateUserDTO {
  @ApiProperty({ default: AuthType.EMAIL })
  authType: AuthType;
}
