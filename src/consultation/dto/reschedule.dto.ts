import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsISO8601, IsMilitaryTime, IsNumber, IsString } from 'class-validator';
import { IsBiggerThan } from '../validators/is-bigger-than';

export class RescheduleDTO {
  @ApiProperty()
  @IsNumber()
  consultationId: number;

  @ApiProperty()
  @IsISO8601()
  date: string;

  @ApiProperty()
  @IsMilitaryTime()
  startAt: string;

  @ApiProperty()
  @IsMilitaryTime()
  @IsBiggerThan('startAt', {
    message: 'finish time must be after start time',
  })
  finishAt: string;

  @IsString()
  timezone: string;
}
