import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsISO8601, IsNumber, IsString } from 'class-validator';

export class GetLawyerScheduleDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  lawyerId: number;

  @ApiProperty()
  @IsString()
  timezone: string;

  @ApiProperty()
  @IsISO8601()
  date: string;
}
