import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { User } from '../../user/user.entity';

export class CreateLawyerDto {
  @ApiProperty()
  user: User;
}
