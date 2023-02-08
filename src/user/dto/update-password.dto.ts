import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class UpdatePasswordDTO {
  @ApiProperty()
  password: string;

  @ApiProperty()
  repeatedPassword: string;
}
