import { ApiProperty } from '@nestjsx/crud/lib/crud';

export default class GetSharedLinkDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  consultationId: number;

  @ApiProperty()
  conversationUserId: number;

  @ApiProperty()
  link: string;

  @ApiProperty()
  belongsToMe: boolean;
}
