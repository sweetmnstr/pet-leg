import { RequestTypes } from '../enum/request-types.enum';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestDto {
  @IsEnum(RequestTypes)
  @Type(() => String)
  type: RequestTypes;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Type(() => String)
  context?: string;
}
