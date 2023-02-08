import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTypeToFAQCatrgory1671652161744 implements MigrationInterface {
  name = 'addTypeToFAQCatrgory1671652161744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."faq_type_enum" AS ENUM('faq', 'help_center')`,
    );
    await queryRunner.query(
      `ALTER TABLE "faq" ADD "type" "public"."faq_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "faq" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."faq_type_enum"`);
  }
}
