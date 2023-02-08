import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEmailToRequest1671045663812 implements MigrationInterface {
  name = 'addEmailToRequest1671045663812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "request" ADD "email" character varying`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."request_type_enum" RENAME TO "request_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."request_type_enum" AS ENUM('registrationRequest', 'verificationRequest', 'askQuestionRequest')`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" ALTER COLUMN "type" TYPE "public"."request_type_enum" USING "type"::"text"::"public"."request_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."request_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."request_type_enum_old" AS ENUM('registrationRequest', 'verificationRequest')`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" ALTER COLUMN "type" TYPE "public"."request_type_enum_old" USING "type"::"text"::"public"."request_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."request_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."request_type_enum_old" RENAME TO "request_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "request" DROP COLUMN "email"`);
  }
}
