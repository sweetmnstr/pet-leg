import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class IsLawyersInFavoritesDTO {
  @ApiProperty()
  lawyerId: number;

  @ApiProperty()
  isInFavorites: boolean;
}
