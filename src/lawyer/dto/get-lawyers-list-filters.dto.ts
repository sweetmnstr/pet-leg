import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { FilterValues } from '../enums/filter-values.enum';

export class GetLawyersListFiltersDto {
  @ApiProperty()
  filterName: string;

  @ApiProperty()
  filterValues: Array<FilterValues> | Array<string>;

  @ApiProperty()
  filterLocales: Record<string, Record<string, string>>;
}
