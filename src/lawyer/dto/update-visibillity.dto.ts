import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateVisibillityDto {
  @ApiProperty()
  @IsBoolean()
  @Type(() => Boolean)
  hideFeedbacks: boolean;
}
