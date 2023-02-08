import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsOptional } from 'class-validator';

export class AddReportInfoDTO {
  id: number;

  @ApiProperty()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsOptional()
  gender?: string;

  @ApiProperty()
  @IsOptional()
  age?: number;

  @ApiProperty()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsOptional()
  statusOfBenificiary?: string;

  @ApiProperty()
  @IsOptional()
  placeOfResidence?: string;

  @ApiProperty()
  @IsOptional()
  clientOther?: string;

  @ApiProperty()
  @IsOptional()
  date?: string;

  @ApiProperty()
  @IsOptional()
  lawService?: string;

  @ApiProperty()
  @IsOptional()
  caseOther?: string;

  @ApiProperty()
  @IsOptional()
  typeOfAsstistance?: string;

  @ApiProperty()
  @IsOptional()
  amountOfConsultation?: string;

  @ApiProperty()
  moreDetails?: string;
}
