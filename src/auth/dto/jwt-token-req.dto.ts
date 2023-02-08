import { ApiProperty } from '@nestjsx/crud/lib/crud';
export class JWTTokenReqDto {
  @ApiProperty()
  'x-auth-token': string;
}
