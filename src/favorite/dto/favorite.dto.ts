import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class FavoriteDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  legalArea: string;

  @ApiProperty()
  verified: boolean;

  @ApiProperty()
  online: boolean;

  @ApiProperty()
  solvedIssues: number;

  @ApiProperty()
  yearsOfExperience: number;

  @ApiProperty()
  description: string;
}
