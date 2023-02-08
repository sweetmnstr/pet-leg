import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { LawyerProfileDto } from '../../lawyer/dto/lawyer-profile.dto';

export class GetCustomerFavoritesDTO {
  @ApiProperty()
  total: number;

  @ApiProperty()
  favorites: Array<LawyerProfileDto>;
}
