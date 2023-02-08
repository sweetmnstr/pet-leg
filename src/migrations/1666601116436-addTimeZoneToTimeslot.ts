import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTimeZoneToTimeslot1666601116436 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "timeSlot" ADD COLUMN "timeZone" text',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "timeSlot" DROP COLUMN "timeZone"');
  }
}
