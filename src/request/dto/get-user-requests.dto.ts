import { IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestTypes } from '../enum/request-types.enum';
import { RequestStatusesEnum } from '../enum/request-statuses.enum';

export class GetUserRequestsDto {
  @IsEnum(RequestTypes)
  @Type(() => String)
  @IsOptional()
  type?: RequestTypes;

  @IsEnum(RequestStatusesEnum)
  @Type(() => String)
  @IsOptional()
  status?: RequestStatusesEnum;
}
