import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class AddLawyerToFavoritesDTO {
  @ApiProperty()
  lawyerId: number;
}
