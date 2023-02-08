import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeDateFromSchedule1667049685266 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "schedule" DROP COLUMN date');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "schedule" ADD COLUMN date date');
  }
}
