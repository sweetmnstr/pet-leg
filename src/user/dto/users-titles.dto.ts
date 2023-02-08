import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class UsersTitlesDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  photo: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  twilioIdentitySid: string;
}
