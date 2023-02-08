import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRequestDto } from './create-request.dto';

export class CreateAskQuestionRequestDto extends CreateRequestDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Type(() => String)
  email?: string;
}
