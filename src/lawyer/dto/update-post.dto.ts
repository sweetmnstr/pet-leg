import { IsUrl } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePostDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  postId: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  lawyerId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  enableComments?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsUrl(undefined, { each: true })
  thumbnails?: string[];

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
