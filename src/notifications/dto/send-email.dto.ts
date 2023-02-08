import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsString } from 'class-validator';

export class SendEmailDTO {
  @ApiProperty({ required: false, default: null })
  @IsString()
  email: string;

  @ApiProperty({ required: false, default: null })
  @IsString()
  content: string;

  @ApiProperty({ required: false, default: null })
  @IsString()
  link: string;
}
