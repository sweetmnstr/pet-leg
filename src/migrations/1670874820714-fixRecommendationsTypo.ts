import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixRecommendationsTypo1670874820714 implements MigrationInterface {
  name = 'fixRecommendationsTypo1670874820714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."recommendations_type_enum" AS ENUM('popular search', 'recommendations')`,
    );
    await queryRunner.query(
      `CREATE TABLE "recommendations" ("id" SERIAL NOT NULL, "type" "public"."recommendations_type_enum", "values" text array NOT NULL, "locales" json NOT NULL, CONSTRAINT "PK_23a8d2db26db8cabb6ae9d6cd87" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "recommendations"`);
    await queryRunner.query(`DROP TYPE "public"."recommendations_type_enum"`);
  }
}
