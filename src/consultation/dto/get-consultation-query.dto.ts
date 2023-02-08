import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsNumber, IsOptional } from 'class-validator';
import { RequestStatuses } from '../enums/request-statuses.enum';

export class GetConsultationQueryDTO {
  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  date?: string;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  dateEnd?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(RequestStatuses)
  status: RequestStatuses;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
