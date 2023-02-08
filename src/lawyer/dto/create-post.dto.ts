import { IsUrl } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  lawyerId: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  enableComments?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsUrl(undefined, { each: true })
  thumbnails: string[];

  @ApiProperty()
  @IsString({ each: true })
  tags: string[];
}
