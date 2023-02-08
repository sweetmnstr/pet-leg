import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class GetConsultaionDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  lawyerId: number;

  @ApiProperty()
  customerId: number;

  @ApiProperty()
  communicationChannel: string | null;

  @ApiProperty()
  timeslots: Array<{
    date: string;
    startAt: string;
    finishAt: string;
    timezone: string;
  }>;

  @ApiProperty()
  status: string;
}
