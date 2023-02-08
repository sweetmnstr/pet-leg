import { MigrationInterface, QueryRunner } from 'typeorm';

export class LawyersListFilters1663789161823 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "lawyers-filter" (
        id SERIAL,
        "filterName" varchar(45) NOT NULL,
        "filterValues" text[] NOT NULL,
        PRIMARY KEY (id)
      );
        INSERT INTO "lawyers-filter"("filterName", "filterValues")
        VALUES('specialization', ARRAY ['internallyDisplacedPersons', 'socialWelfarePrograms', 'pension', 'employmentIssues', 'registrationOfBirth', 'registrationOfDeath', 'diia', 'missingPerson', 'accessToHealthcare', 'accessToEducation', 'familyRelations', 'childrenAndMinors', 'goingAbroad', 'rulesForPetOwners', 'hlp', 'compensationForProperty', 'mortgageAndLoanIssues', 'willsAndInheritance', 'conscription', 'veteransRightsAndGuarantees', 'entrepreneurship', 'regulationOfVolunteerActivities', 'citizenship', 'reefugeesProtection', 'recoveryPersonalDocumentation', 'drivingLicenseAndRegistration']);

        INSERT INTO "lawyers-filter"("filterName", "filterValues")
        VALUES('country', ARRAY ['Ukraine', 'Germany', 'Poland', 'Greece', 'Romania', 'Moldova', 'Italy', 'Denmark', 'Serbia']);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "lawyers-filter";`);
  }
}
