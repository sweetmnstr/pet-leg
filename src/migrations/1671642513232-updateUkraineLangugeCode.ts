import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUkraineLangugeCode1671642513232
  implements MigrationInterface
{
  name = 'updateUkraineLangugeCode1671642513232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."lawyer_language_enum" AS ENUM('uk', 'en')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_platformlanguage_enum" AS ENUM('uk', 'en')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE "public"."user_platformlanguage_enum"`);
    await queryRunner.query(`DROP TYPE "public"."lawyer_language_enum"`);
  }
}
