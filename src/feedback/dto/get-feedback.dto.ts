import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class GetFeedbackDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  grade: number;

  @ApiProperty({ required: false, default: null })
  review?: string;

  @ApiProperty()
  createdAt: Date;
}
