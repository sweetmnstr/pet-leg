import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { LawyerProfileDto } from '../../lawyer/dto/lawyer-profile.dto';
import { GetCustomerProfileDTO } from '../../customer/dto/get-customer-profile.dto';

export class GetAddedFavoriteDTO {
  @ApiProperty()
  lawyer: LawyerProfileDto;

  @ApiProperty()
  customer: GetCustomerProfileDTO;
}
