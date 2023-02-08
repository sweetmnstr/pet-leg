import { MigrationInterface, QueryRunner } from 'typeorm';

export class addVideoThumbnailToLawyer1670586935776
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "lawyer" ADD COLUMN "introVideoThumbnail" text',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "lawyer" DROP COLUMN "introVideoThumbnail"',
    );
  }
}
