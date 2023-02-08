import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsUrl } from 'class-validator';

export class UpdateSharedLinkDTO {
  @ApiProperty()
  @IsUrl()
  link: string;
}
