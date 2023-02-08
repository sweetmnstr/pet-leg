import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { GetFeedbackDTO } from './get-feedback.dto';

export class GetLawyerFeedbackDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  grades: { [star: string]: number };

  @ApiProperty()
  averageGrade: number;

  @ApiProperty()
  reviews: Array<GetFeedbackDTO>;
}
