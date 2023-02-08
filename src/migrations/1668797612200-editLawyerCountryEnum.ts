import { MigrationInterface, QueryRunner } from 'typeorm';

export class editLawyerCountryEnum1668797612200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TYPE IF EXISTS public.lawyer_country_v2_enum;
         CREATE TYPE public.lawyer_country_v2_enum AS ENUM (
            'Ukraine',
            'Germany',
            'Poland',
            'Greece',
            'Romania',
            'Moldova',
            'Italy',
            'Denmark',
            'Serbia',
            'ukraine',
            'germany',
            'poland',
            'greece',
            'romania',
            'moldova',
            'italy',
            'denmark',
            'serbia'
        );
        ALTER TABLE lawyer
        ALTER COLUMN country TYPE public.lawyer_country_v2_enum
        USING country::text::public.lawyer_country_v2_enum;

        UPDATE lawyer
        SET country = 'ukraine' 
        WHERE country = 'Ukraine';
        UPDATE lawyer
        SET country = 'poland' 
        WHERE country = 'Poland';

        DELETE FROM "lawyers-filter"
        WHERE "filterName" = 'country';
        INSERT INTO "lawyers-filter"("filterName", "filterValues")
        VALUES('country', ARRAY ['ukraine', 'germany', 'poland', 'greece', 'romania', 'moldova', 'italy', 'denmark', 'serbia']);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TYPE IF EXISTS public.lawyer_country_enum;
        CREATE TYPE public.lawyer_country_enum AS ENUM (
           'Ukraine',
           'Germany',
           'Poland',
           'Greece',
           'Romania',
           'Moldova',
           'Italy',
           'Denmark',
           'Serbia',
           'ukraine',
           'germany',
           'poland',
           'greece',
           'romania',
           'moldova',
           'italy',
           'denmark',
           'serbia'
       );
       ALTER TABLE lawyer
       ALTER COLUMN country TYPE public.lawyer_country_enum
       USING country::text::public.lawyer_country_enum;

       UPDATE lawyer
       SET country = 'Ukraine' 
       WHERE country = 'ukraine';
       UPDATE lawyer
       SET country = 'Poland' 
       WHERE country = 'poland'
       
       DELETE FROM "lawyers-filter"
       WHERE "filterName" = 'country';
       INSERT INTO "lawyers-filter"("filterName", "filterValues")
       VALUES('country', ARRAY ['Ukraine', 'Germany', 'Poland', 'Greece', 'Romania', 'Moldova', 'Italy', 'Denmark', 'Serbia']);`,
    );
  }
}
