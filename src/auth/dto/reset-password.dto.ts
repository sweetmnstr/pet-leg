import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsNotEmpty } from 'class-validator';
export class ResetPasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
