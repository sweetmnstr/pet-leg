import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { DayAvailability } from '../types/availability.type';

export class AvailabilityDTO {
  @ApiProperty()
  monday: DayAvailability[];

  @ApiProperty()
  tuesday: DayAvailability[];

  @ApiProperty()
  wednesday: DayAvailability[];

  @ApiProperty()
  thursday: DayAvailability[];

  @ApiProperty()
  friday: DayAvailability[];

  @ApiProperty()
  saturday: DayAvailability[];

  @ApiProperty()
  sunday: DayAvailability[];

  @ApiProperty()
  timezone: string;
}
