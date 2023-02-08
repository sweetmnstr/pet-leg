import { IsOptional, IsString } from 'class-validator';

export class GetLawyersByGeolocationDTO {
  @IsString()
  @IsOptional()
  filters: string;

  @IsString()
  @IsString()
  sortBy: string;

  @IsString()
  country: string;

  @IsString()
  city: string;
}
