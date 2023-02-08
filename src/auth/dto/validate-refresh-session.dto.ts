import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsOptional, IsString } from 'class-validator';

export class ValidateRefreshSessionDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;

  @ApiProperty()
  @IsString()
  fingerprint: string;

  @ApiProperty()
  @IsString()
  ip: string;

  @ApiProperty()
  @IsOptional()
  isRegistrationSession?: boolean;
}
