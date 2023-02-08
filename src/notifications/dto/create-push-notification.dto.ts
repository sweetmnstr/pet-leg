import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { NotificationTypes } from '../enums/notification-types.enum';

export class CreatePushNotificationDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @ApiProperty({ default: null })
  @IsString()
  content: string;

  @ApiProperty({ default: null })
  @IsString()
  link: string;

  @ApiProperty()
  @IsEnum(NotificationTypes)
  type: NotificationTypes;
}
