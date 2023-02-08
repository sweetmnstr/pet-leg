import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsNumber, IsString } from 'class-validator';

export class RefreshSessionDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsString()
  refreshToken?: string;

  @ApiProperty()
  @IsString()
  fingerprint: string;

  @ApiProperty()
  @IsString()
  ip: string;

  @ApiProperty()
  @IsString()
  ua?: string;
}
