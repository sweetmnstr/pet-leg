import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class UpdateUserNotificationFiltersDTO {
  @ApiProperty()
  customerSessionUpdates?: boolean;

  @ApiProperty()
  lawyerSessionUpdates?: boolean;

  @ApiProperty()
  customerNewMessages?: boolean;

  @ApiProperty()
  lawyerNewMessages?: boolean;

  @ApiProperty()
  customerSharedLinksUpdates?: boolean;

  @ApiProperty()
  lawyerSharedLinksUpdates?: boolean;

  @ApiProperty()
  customerGeneralNotifications?: boolean;

  @ApiProperty()
  lawyerGeneralNotifications?: boolean;
}
