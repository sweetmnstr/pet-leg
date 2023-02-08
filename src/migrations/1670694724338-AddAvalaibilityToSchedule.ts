import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvalaibilityToSchedule1670694724338
  implements MigrationInterface
{
  name = 'AddAvalaibilityToSchedule1670694724338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "schedule" ADD "availability" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedule" DROP COLUMN "availability"`,
    );
  }
}
