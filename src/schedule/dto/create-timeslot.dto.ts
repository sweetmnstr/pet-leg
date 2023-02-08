import { IsISO8601, IsMilitaryTime, IsNumber, IsString } from 'class-validator';
import { Lawyer } from '../../lawyer/entities/lawyer.entity';

export class CreateTimeslotDTO {
  @IsNumber()
  lawyer: Lawyer;

  @IsISO8601()
  date: string;

  @IsMilitaryTime()
  startAt: string;

  @IsMilitaryTime()
  finishAt: string;

  @IsString()
  timezone: string;
}
