import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDateToSchedule1666601904315 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "schedule" ADD COLUMN date date');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "schedule" DROP COLUMN date');
  }
}
