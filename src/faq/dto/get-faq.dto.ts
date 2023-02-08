import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FAQTypes } from '../enums/faq-types.enum';

export class GetFAQDTO {
  @ApiProperty()
  @IsEnum(FAQTypes)
  type: FAQTypes;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  question?: string;
}
