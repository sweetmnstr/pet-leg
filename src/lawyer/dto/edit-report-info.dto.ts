import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Gender } from '../enums/gender.enum';
import { TypeOfAsstistance } from '../enums/type-of-asstistance.enum';

export class EditReportInfoDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  gender?: Gender;

  @ApiProperty()
  age?: number;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  statusOfBenificiary: string;

  @ApiProperty()
  placeOfResidence: string;

  @ApiProperty()
  placeOfConsultation?: string;

  @ApiProperty()
  clientOther?: string;

  @ApiProperty()
  date?: string;

  @ApiProperty()
  lawService?: string;

  @ApiProperty()
  caseOther?: string;

  @ApiProperty()
  typeOfAssistance?: TypeOfAsstistance;

  @ApiProperty()
  amountOfConsultations?: string;

  @ApiProperty()
  moreDetails?: string;
}
