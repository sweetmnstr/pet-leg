import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsNumber } from 'class-validator';

export class GetCategoryDto {
  @ApiProperty()
  categoryId: number;

  @IsNumber()
  postsForPage: number;

  @IsNumber()
  page: number;
}
