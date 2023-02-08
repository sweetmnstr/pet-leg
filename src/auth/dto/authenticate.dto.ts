import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsString } from 'class-validator';
import { GetCustomerProfileDTO } from '../../customer/dto/get-customer-profile.dto';
import { LawyerProfileDto } from '../../lawyer/dto/lawyer-profile.dto';
import { Customer } from '../../customer/customer.entity';
import { Lawyer } from '../../lawyer/entities/lawyer.entity';
export class AuthenticateDto {
  @ApiProperty()
  @IsString()
  accessToken?: string;

  @ApiProperty()
  @IsString()
  refreshToken: string;

  @ApiProperty()
  user: GetCustomerProfileDTO | LawyerProfileDto | Customer | Lawyer | null;
}
