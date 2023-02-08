import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsArray } from 'class-validator';

export class DescribeLawyerSessionsDto {
  @ApiProperty()
  @IsArray()
  lawyerIds: number[];
}
