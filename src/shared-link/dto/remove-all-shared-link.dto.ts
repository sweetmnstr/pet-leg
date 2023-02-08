import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class RemoveAllSharedLinkDTO {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  consultationId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  conversationUserId?: number;
}
