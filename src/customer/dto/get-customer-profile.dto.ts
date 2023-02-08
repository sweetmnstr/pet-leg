import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class GetCustomerProfileDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId?: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ required: false, default: '' })
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, isArray: true })
  photo: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty({ requried: false, default: {} })
  bindedSocials: { [p: string]: any };
}
