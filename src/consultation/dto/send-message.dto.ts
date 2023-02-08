import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  lawyerId: number;

  @ApiProperty()
  @IsString()
  @Type(() => String)
  message: string;
}
