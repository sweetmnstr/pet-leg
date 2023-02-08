import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { LawyersFilter } from './entities/lawyers-filter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLawyersListFiltersDto } from './dto/get-lawyers-list-filters.dto';
import * as filtersLocales from '../common/filters-locales.json';
import { Lawyer } from './entities/lawyer.entity';

@Injectable()
export class LawyerFiltersService extends TypeOrmCrudService<LawyersFilter> {
  constructor(
    @InjectRepository(LawyersFilter)
    private lawyerFiltersRepository: Repository<LawyersFilter>,
    @InjectRepository(Lawyer)
    private lawyerRepository: Repository<Lawyer>,
  ) {
    super(lawyerFiltersRepository);
  }

  async getLawyerCountries(): Promise<string[]> {
    const countriesRaw = await this.lawyerRepository
      .createQueryBuilder('lawyer')
      .select('LOWER(lawyer.country)')
      .distinct(true)
      .getRawMany();

    return countriesRaw.reduce(
      (countries, countryRaw) =>
        countryRaw.lower ? [...countries, countryRaw.lower] : countries,
      [],
    );
  }

  async getLawyersListFilters(): Promise<GetLawyersListFiltersDto[]> {
    const locales = ['en', 'uk'];
    const filters = await this.lawyerFiltersRepository.find({
      select: {
        filterName: true,
        filterValues: true,
      },
    });

    const countries = await this.getLawyerCountries();

    const mergedFilters = [
      ...filters,
      { filterName: 'country', filterValues: countries },
    ];

    return mergedFilters.map((filter) => {
      const filterLocales = {};
      locales.forEach((locale) => {
        const language = {};
        filter.filterValues.forEach((filterValue) => {
          language[filterValue] = filtersLocales[filterValue]
            ? filtersLocales[filterValue][locale]
            : filterValue;
        });
        filterLocales[locale] = language;
      });

      return {
        ...filter,
        filterLocales,
      };
    });
  }
}
