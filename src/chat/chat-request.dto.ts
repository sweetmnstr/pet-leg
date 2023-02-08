import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ChatRequestDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  user1Id?: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  senderId?: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  user2Id?: number;

  @ApiProperty()
  operation: string;
}
