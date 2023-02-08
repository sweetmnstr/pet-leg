import { IsISO8601, IsMilitaryTime, IsNumber, IsString } from 'class-validator';
import { Consultation } from '../../consultation/consultation.entity';
import { Lawyer } from '../../lawyer/entities/lawyer.entity';

export class UpdateTimeslotDTO {
  @IsNumber()
  lawyer: Lawyer;

  @IsNumber()
  consultation: Consultation;

  @IsISO8601()
  date: string;

  @IsMilitaryTime()
  startAt: string;

  @IsMilitaryTime()
  finishAt: string;

  @IsString()
  timezone: string;
}
