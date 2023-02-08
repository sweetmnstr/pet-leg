import { IsNumber, IsOptional } from 'class-validator';

export class GetFavoriteParams {
  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  page?: number;
}
