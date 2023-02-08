import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsMilitaryTime,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateConsultationRequestDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  lawyerId: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  customerId: number;

  @ApiProperty()
  @IsISO8601()
  date: string;

  @ApiProperty()
  @IsMilitaryTime()
  startAt: string;

  @ApiProperty()
  @IsMilitaryTime()
  finishAt: string;

  @ApiProperty()
  @IsString()
  timezone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  communicationChannel?: string;
}
