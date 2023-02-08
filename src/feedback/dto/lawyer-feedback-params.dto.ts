import { IsNumber, IsOptional } from 'class-validator';

export class LawyerFeedbackParamsDto {
  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  page?: number;
}
