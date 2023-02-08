export type Availability = {
  monday: DayAvailability[];
  tuesday: DayAvailability[];
  wednesday: DayAvailability[];
  thursday: DayAvailability[];
  friday: DayAvailability[];
  saturday: DayAvailability[];
  sunday: DayAvailability[];
};

export type DayAvailability = {
  from: string;
  to: string;
};
