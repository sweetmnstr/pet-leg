import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Post } from '../../post/post.entity';

export class CreateCommentDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  createdById: number;

  @ApiProperty()
  post: Post;

  @ApiProperty()
  @IsOptional()
  @IsString()
  content: string;
}
