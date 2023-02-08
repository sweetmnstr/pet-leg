import { IsUrl } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { User } from '../../user/user.entity';

export class CreatePostDTO {
  createdBy: User;

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
