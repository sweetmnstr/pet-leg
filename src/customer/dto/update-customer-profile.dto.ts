import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsEmail, IsJSON, IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateCustomerProfileDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  photo?: string;

  @ApiProperty({ default: '{}' })
  @IsOptional()
  @IsJSON()
  notificationFilters?: string;
}
