import { IsNumber, IsString } from 'class-validator';

export class GetListDto {
  @IsString()
  filters: string;

  @IsString()
  search?: string;

  @IsString()
  sortBy?: string;

  @IsNumber()
  lawyersForPage: number;

  @IsNumber()
  page: number;
}
