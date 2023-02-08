import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  customerId: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  lawyerId: number;

  @ApiProperty({ required: false, default: null })
  @IsOptional()
  @IsString()
  review: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  grade: number;
}
