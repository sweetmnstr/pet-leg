import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsNumber, IsOptional } from 'class-validator';
import { PostStatuses } from '../../post/enums/post-statuses.enum';
export class GetPostsQueryDTO {
  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  date?: string;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  dateEnd?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(PostStatuses)
  status: PostStatuses;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
