import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class RemoveLawyerFromFavoritesDTO {
  @ApiProperty()
  lawyerId: number;
}
