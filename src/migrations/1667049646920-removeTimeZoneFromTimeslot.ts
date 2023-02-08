import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeTimeZoneFromTimeslot1667049646920
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "timeSlot" DROP COLUMN "timeZone"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "timeSlot" ADD COLUMN "timeZone" text',
    );
  }
}
