import { IsUrl } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class AddSharedLinkDTO {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  consultationId?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  conversationUserId?: number;

  @ApiProperty()
  @IsUrl()
  link: string;

  email?: string;
}
