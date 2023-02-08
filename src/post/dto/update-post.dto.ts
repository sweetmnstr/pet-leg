import { IsUrl } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { User } from '../../user/user.entity';

export class UpdatePostDTO {
  user: User;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  postId: number;

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
