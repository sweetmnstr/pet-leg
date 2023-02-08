import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateRecommendations1673382818572 implements MigrationInterface {
  name = 'updateRecommendations1673382818572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recommendations" ADD "category" text`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."recommendations_type_enum" RENAME TO "recommendations_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recommendations_type_enum" AS ENUM('popular search', 'recommendations', 'lawyers links')`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" ALTER COLUMN "type" TYPE "public"."recommendations_type_enum" USING "type"::"text"::"public"."recommendations_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."recommendations_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."recommendations_type_enum_old" AS ENUM('popular search', 'recommendations')`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" ALTER COLUMN "type" TYPE "public"."recommendations_type_enum_old" USING "type"::"text"::"public"."recommendations_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."recommendations_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."recommendations_type_enum_old" RENAME TO "recommendations_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" DROP COLUMN "category"`,
    );
  }
}
